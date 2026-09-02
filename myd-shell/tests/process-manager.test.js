const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { ProcessManager, ProcessHandle } = require('../src/process-manager');
const { CwdManager } = require('../src/cwd-manager');

const IS_WIN = os.platform() === 'win32';

// Helper: a long-running command that responds to SIGTERM on both platforms
function sleepCmd(seconds) {
  if (IS_WIN) {
    // Use PowerShell to sleep — it responds to kill properly
    return `powershell -Command "Start-Sleep -Seconds ${seconds}"`;
  }
  return `sleep ${seconds}`;
}

// Helper: echo to stderr
function echoStderr(text) {
  if (IS_WIN) {
    return `powershell -Command "Write-Error '${text}'"`;
  }
  return `echo ${text} >&2`;
}

describe('ProcessManager', () => {
  let tmpDir, subDir;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'myd-shell-proc-'));
    subDir = path.join(tmpDir, 'subdir');
    fs.mkdirSync(subDir, { recursive: true });
  });

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('runSync', () => {
    it('should run a simple command synchronously', () => {
      const pm = new ProcessManager({ cwdManager: new CwdManager({ cwd: tmpDir }) });
      const result = pm.runSync('echo hello');
      assert.strictEqual(result.exitCode, 0);
      assert.ok(result.stdout.trim().includes('hello'));
    });

    it('should capture stderr', () => {
      const pm = new ProcessManager({ cwdManager: new CwdManager({ cwd: tmpDir }) });
      const result = pm.runSync(echoStderr('error'));
      assert.ok(result.stderr.trim().includes('error'));
    });

    it('should respect CWD', () => {
      const mgr = new CwdManager({ cwd: tmpDir });
      const pm = new ProcessManager({ cwdManager: mgr });
      const cmd = IS_WIN ? 'cd' : 'pwd';
      const result = pm.runSync(cmd);
      assert.ok(result.stdout.trim().includes(tmpDir));
    });

    it('should handle non-zero exit code', () => {
      const pm = new ProcessManager({ cwdManager: new CwdManager({ cwd: tmpDir }) });
      const cmd = IS_WIN ? 'cmd /c exit 42' : 'exit 42';
      const result = pm.runSync(cmd);
      assert.strictEqual(result.exitCode, 42);
    });
  });

  describe('run (async)', () => {
    it('should run a command asynchronously', async () => {
      const pm = new ProcessManager({ cwdManager: new CwdManager({ cwd: tmpDir }) });
      const proc = pm.run('echo hello');
      assert.ok(proc instanceof ProcessHandle);
      const { exitCode, stdout } = await proc.wait();
      assert.strictEqual(exitCode, 0);
      assert.ok(stdout.trim().includes('hello'));
    });

    it('should stream stdout via events', async () => {
      const pm = new ProcessManager({ cwdManager: new CwdManager({ cwd: tmpDir }) });
      const proc = pm.run('echo line1 && echo line2');
      let output = '';
      proc.on('stdout', (chunk) => { output += chunk; });
      await proc.wait();
      assert.ok(output.includes('line1'));
      assert.ok(output.includes('line2'));
    });

    it('should track process info', async () => {
      const pm = new ProcessManager({ cwdManager: new CwdManager({ cwd: tmpDir }) });
      const proc = pm.run(sleepCmd(3));
      const info = proc.info;
      assert.strictEqual(info.command, sleepCmd(3));
      assert.ok(info.id);
      assert.strictEqual(info.running, true);
      assert.ok(info.startTime > 0);
      proc.kill();
      await new Promise(r => setTimeout(r, 500));
      assert.strictEqual(proc.running, false);
    });

    it('should list running processes', async () => {
      const pm = new ProcessManager({ cwdManager: new CwdManager({ cwd: tmpDir }) });
      const proc = pm.run(sleepCmd(5));
      const list = pm.list();
      assert.ok(list.length >= 1);
      assert.ok(list.some(p => p.id === proc.id));
      proc.kill();
      await new Promise(r => setTimeout(r, 500));
    });

    it('should kill a process', async () => {
      const pm = new ProcessManager({ cwdManager: new CwdManager({ cwd: tmpDir }) });
      const proc = pm.run(sleepCmd(10));
      assert.strictEqual(proc.running, true);
      proc.kill();
      await new Promise(r => setTimeout(r, 500));
      assert.strictEqual(proc.running, false);
    });

    it('should emit exit event', async () => {
      const pm = new ProcessManager({ cwdManager: new CwdManager({ cwd: tmpDir }) });
      const proc = pm.run('echo done');
      const exitPromise = new Promise(resolve => {
        proc.on('exit', (code) => resolve(code));
      });
      const code = await exitPromise;
      assert.strictEqual(code, 0);
    });

    it('should clean up completed processes', async () => {
      const pm = new ProcessManager({ cwdManager: new CwdManager({ cwd: tmpDir }) });
      const proc = pm.run('echo quick');
      await proc.wait();
      await new Promise(r => setTimeout(r, 200));
      assert.strictEqual(pm.list().length, 0);
    });
  });

  describe('exec', () => {
    it('should handle cd built-in and change CWD', () => {
      const mgr = new CwdManager({ cwd: tmpDir });
      const pm = new ProcessManager({ cwdManager: mgr });
      const result = pm.exec('cd subdir');
      assert.strictEqual(result.handled, true);
      assert.strictEqual(mgr.cwd, subDir);
    });

    it('should run shell commands', async () => {
      const pm = new ProcessManager({ cwdManager: new CwdManager({ cwd: tmpDir }) });
      const result = pm.exec('echo hello');
      assert.strictEqual(result.handled, false);
      assert.strictEqual(result.exitCode, 0);
      assert.ok(result.output.includes('hello'));
    });

    it('should run async commands when requested', () => {
      const pm = new ProcessManager({ cwdManager: new CwdManager({ cwd: tmpDir }) });
      const result = pm.exec('echo async', { async: true });
      assert.strictEqual(result.handled, false);
      assert.ok(result.process instanceof ProcessHandle);
      result.process.kill();
    });
  });

  describe('process lifecycle', () => {
    it('should get process by ID', async () => {
      const pm = new ProcessManager({ cwdManager: new CwdManager({ cwd: tmpDir }) });
      const proc = pm.run(sleepCmd(5));
      const found = pm.get(proc.id);
      assert.ok(found);
      assert.strictEqual(found.id, proc.id);
      proc.kill();
      await new Promise(r => setTimeout(r, 500));
    });

    it('should kill all processes', async () => {
      const pm = new ProcessManager({ cwdManager: new CwdManager({ cwd: tmpDir }) });
      const p1 = pm.run(sleepCmd(5));
      const p2 = pm.run(sleepCmd(5));
      pm.killAll();
      await new Promise(r => setTimeout(r, 500));
      assert.strictEqual(p1.running, false);
      assert.strictEqual(p2.running, false);
    });
  });
});
