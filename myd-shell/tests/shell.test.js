const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { Shell } = require('../src/index');

const IS_WIN = os.platform() === 'win32';

function sleepCmd(seconds) {
  if (IS_WIN) return `powershell -Command "Start-Sleep -Seconds ${seconds}"`;
  return `sleep ${seconds}`;
}

describe('Shell', () => {
  let tmpDir, subDir;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'myd-shell-integration-'));
    // Resolve to real path (fixes Windows 8.3 short names like ADMINI~1)
    try { tmpDir = fs.realpathSync(tmpDir); } catch {}
    subDir = path.join(tmpDir, 'project');
    fs.mkdirSync(subDir, { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'file.txt'), 'test');
  });

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('cd integration', () => {
    it('should change cwd for subsequent commands', () => {
      const shell = new Shell({ cwd: tmpDir });
      shell.cd('project');
      // Both shell.cwd and subDir should resolve to the same directory
      assert.strictEqual(path.resolve(shell.cwd), path.resolve(subDir));
    });

    it('should persist CWD across multiple exec calls', () => {
      const shell = new Shell({ cwd: tmpDir });
      shell.cd('project');
      assert.strictEqual(shell.cwd, subDir);

      const cmd = IS_WIN ? 'cd' : 'pwd';
      const r1 = shell.execSync(cmd);
      const r2 = shell.execSync(cmd);
      assert.strictEqual(r1.output.trim(), r2.output.trim());
    });

    it('should handle cd in execSync call', () => {
      const shell = new Shell({ cwd: tmpDir });
      shell.execSync('cd project');
      assert.strictEqual(shell.cwd, subDir);
    });

    it('should handle cd - to go back', () => {
      const shell = new Shell({ cwd: tmpDir });
      shell.cd(subDir);
      assert.strictEqual(shell.cwd, subDir);

      shell.cd('-');
      assert.strictEqual(shell.cwd, tmpDir);
    });
  });

  describe('execSync', () => {
    it('should run commands and capture output', () => {
      const shell = new Shell({ cwd: tmpDir });
      const result = shell.execSync('echo hello world');
      assert.strictEqual(result.exitCode, 0);
      assert.ok(result.output.includes('hello world'));
    });

    it('should handle non-existent commands', () => {
      const shell = new Shell({ cwd: tmpDir });
      const result = shell.execSync('nonexistentcommand123');
      assert.notStrictEqual(result.exitCode, 0);
      assert.strictEqual(result.isError, true);
    });

    it('should show pwd in output', () => {
      const shell = new Shell({ cwd: tmpDir });
      const result = shell.execSync('pwd');
      assert.ok(result.output.trim().includes(tmpDir));
    });
  });

  describe('execAsync', () => {
    it('should return ProcessHandle for shell commands', () => {
      const shell = new Shell({ cwd: tmpDir });
      const result = shell.execAsync('echo async');
      assert.ok(result.wait);
      result.kill();
    });

    it('should handle built-in commands synchronously', () => {
      const shell = new Shell({ cwd: tmpDir });
      const result = shell.execAsync('pwd');
      assert.strictEqual(result.handled, true);
      assert.ok(result.output.includes(tmpDir));
    });

    it('should stream output from async process', async () => {
      const shell = new Shell({ cwd: tmpDir });
      const proc = shell.execAsync('echo streamed');
      let output = '';
      proc.on('stdout', (chunk) => { output += chunk; });
      await proc.wait();
      assert.ok(output.includes('streamed'));
    });
  });

  describe('process management', () => {
    it('should track running processes', async () => {
      const shell = new Shell({ cwd: tmpDir });
      const proc = shell.execAsync(sleepCmd(3));
      assert.ok(shell.runningProcesses.length > 0);
      proc.kill();
      await new Promise(r => setTimeout(r, 500));
    });

    it('should stop process by ID', async () => {
      const shell = new Shell({ cwd: tmpDir });
      const proc = shell.execAsync(sleepCmd(5));
      const id = proc.id;
      shell.stopProcess(id);
      await new Promise(r => setTimeout(r, 500));
      assert.strictEqual(proc.running, false);
    });
  });

  describe('state management', () => {
    it('should export and import state', () => {
      const shell1 = new Shell({ cwd: tmpDir });
      shell1.cd('project');
      shell1.setEnv('MY_TEST_VAR', 'hello');

      const state = shell1.exportState();
      assert.strictEqual(state.cwd, subDir);

      const shell2 = new Shell({ cwd: tmpDir });
      shell2.importState(state);
      assert.strictEqual(shell2.cwd, subDir);
      assert.strictEqual(shell2.getEnv('MY_TEST_VAR'), 'hello');
    });
  });

  describe('environment variables', () => {
    it('should set and get env vars', () => {
      const shell = new Shell({ cwd: tmpDir });
      shell.setEnv('MYD_TEST', 'value123');
      assert.strictEqual(shell.getEnv('MYD_TEST'), 'value123');
    });

    it('should make env vars available to commands', () => {
      const shell = new Shell({ cwd: tmpDir });
      shell.setEnv('MYD_TEST_VAR', 'hello');
      const cmd = IS_WIN
        ? 'echo %MYD_TEST_VAR%'
        : 'echo $MYD_TEST_VAR';
      const result = shell.execSync(cmd);
      assert.ok(result.output.includes('hello'));
    });
  });

  describe('history', () => {
    it('should track command history', () => {
      const shell = new Shell({ cwd: tmpDir });
      shell.execSync('echo one');
      shell.execSync('echo two');
      assert.strictEqual(shell.history.length, 2);
      assert.strictEqual(shell.history[0].command, 'echo one');
    });
  });

  describe('destruction', () => {
    it('should clean up on destroy', async () => {
      const shell = new Shell({ cwd: tmpDir });
      shell.execAsync(sleepCmd(5));
      shell.execAsync(sleepCmd(5));
      shell.destroy();
      await new Promise(r => setTimeout(r, 500));
      assert.strictEqual(shell.runningProcesses.length, 0);
    });
  });
});
