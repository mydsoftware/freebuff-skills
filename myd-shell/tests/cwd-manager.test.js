const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { CwdManager } = require('../src/cwd-manager');

describe('CwdManager', () => {
  let tmpDir, subDir, tmpFile;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'myd-shell-test-'));
    subDir = path.join(tmpDir, 'subdir');
    fs.mkdirSync(subDir, { recursive: true });
    tmpFile = path.join(tmpDir, 'file.txt');
    fs.writeFileSync(tmpFile, 'test');
  });

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should initialize with current directory', () => {
    const mgr = new CwdManager();
    assert.strictEqual(mgr.cwd, process.cwd());
  });

  it('should accept custom initial directory', () => {
    const mgr = new CwdManager({ cwd: tmpDir });
    assert.strictEqual(mgr.cwd, tmpDir);
  });

  describe('cd', () => {
    it('should change to absolute path', () => {
      const mgr = new CwdManager({ cwd: tmpDir });
      const result = mgr.cd(subDir);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.cwd, subDir);
      assert.strictEqual(mgr.cwd, subDir);
    });

    it('should change to relative path', () => {
      const mgr = new CwdManager({ cwd: tmpDir });
      const result = mgr.cd('subdir');
      assert.strictEqual(result.success, true);
      assert.strictEqual(mgr.cwd, subDir);
    });

    it('should handle parent directory', () => {
      const mgr = new CwdManager({ cwd: subDir });
      const result = mgr.cd('..');
      assert.strictEqual(result.success, true);
      assert.strictEqual(mgr.cwd, tmpDir);
    });

    it('should handle cd with quoted paths', () => {
      const mgr = new CwdManager({ cwd: tmpDir });
      const result = mgr.cd(`"${subDir}"`);
      assert.strictEqual(result.success, true);
      assert.strictEqual(mgr.cwd, subDir);
    });

    it('should handle cd with single-quoted paths', () => {
      const mgr = new CwdManager({ cwd: tmpDir });
      const result = mgr.cd(`'${subDir}'`);
      assert.strictEqual(result.success, true);
      assert.strictEqual(mgr.cwd, subDir);
    });

    it('should handle cd ~ for home directory', () => {
      const mgr = new CwdManager({ cwd: tmpDir });
      const result = mgr.cd('~');
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.cwd, os.homedir());
    });

    it('should handle cd - for previous directory', () => {
      const mgr = new CwdManager({ cwd: tmpDir });
      mgr.cd(subDir);
      assert.strictEqual(mgr.cwd, subDir);

      const result = mgr.cd('-');
      assert.strictEqual(result.success, true);
      assert.strictEqual(mgr.cwd, tmpDir);
    });

    it('should fail for non-existent directory', () => {
      const mgr = new CwdManager({ cwd: tmpDir });
      const result = mgr.cd('/nonexistent/path');
      assert.strictEqual(result.success, false);
      assert.ok(result.error.includes('not found'));
    });

    it('should fail for non-directory file', () => {
      const mgr = new CwdManager({ cwd: tmpDir });
      const result = mgr.cd(tmpFile);
      assert.strictEqual(result.success, false);
      assert.ok(result.error.includes('Not a directory'));
    });

    it('should default to home directory when no argument', () => {
      const mgr = new CwdManager({ cwd: tmpDir });
      const result = mgr.cd('');
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.cwd, os.homedir());
    });

    it('should track previous directory', () => {
      const mgr = new CwdManager({ cwd: tmpDir });
      mgr.cd(subDir);
      assert.strictEqual(mgr.prevCwd, tmpDir);
      assert.strictEqual(mgr.cwd, subDir);
    });

    it('should maintain history', () => {
      const mgr = new CwdManager({ cwd: tmpDir });
      mgr.cd(subDir);
      mgr.cd(tmpDir);
      const history = mgr.history;
      assert.ok(history.includes(tmpDir));
      assert.ok(history.includes(subDir));
    });
  });

  describe('resolve', () => {
    it('should resolve relative path', () => {
      const mgr = new CwdManager({ cwd: tmpDir });
      const resolved = mgr.resolve('subdir');
      assert.strictEqual(resolved, subDir);
    });

    it('should resolve absolute path', () => {
      const mgr = new CwdManager({ cwd: tmpDir });
      const resolved = mgr.resolve(subDir);
      assert.strictEqual(resolved, subDir);
    });

    it('should resolve ~ to home', () => {
      const mgr = new CwdManager({ cwd: tmpDir });
      const resolved = mgr.resolve('~');
      assert.strictEqual(resolved, os.homedir());
    });
  });

  describe('isDirectory and exists', () => {
    it('should detect directories', () => {
      const mgr = new CwdManager({ cwd: tmpDir });
      assert.strictEqual(mgr.isDirectory('subdir'), true);
      assert.strictEqual(mgr.isDirectory(tmpFile), false);
    });

    it('should detect existing paths', () => {
      const mgr = new CwdManager({ cwd: tmpDir });
      assert.strictEqual(mgr.exists('subdir'), true);
      assert.strictEqual(mgr.exists('nonexistent'), false);
    });
  });

  describe('parseCommand', () => {
    it('should detect cd command', () => {
      const mgr = new CwdManager();
      const parsed = mgr.parseCommand('cd /some/path');
      assert.strictEqual(parsed.builtin, true);
      assert.strictEqual(parsed.action, 'cd');
      assert.strictEqual(parsed.args, '/some/path');
    });

    it('should detect pwd command', () => {
      const mgr = new CwdManager();
      const parsed = mgr.parseCommand('pwd');
      assert.strictEqual(parsed.builtin, true);
      assert.strictEqual(parsed.action, 'pwd');
    });

    it('should detect non-builtin commands', () => {
      const mgr = new CwdManager();
      const parsed = mgr.parseCommand('ls -la');
      assert.strictEqual(parsed.builtin, false);
      assert.strictEqual(parsed.command, 'ls -la');
    });

    it('should handle empty command', () => {
      const mgr = new CwdManager();
      const parsed = mgr.parseCommand('');
      assert.strictEqual(parsed.builtin, true);
      assert.strictEqual(parsed.action, 'empty');
    });
  });

  describe('execBuiltin', () => {
    it('should execute cd', () => {
      const mgr = new CwdManager({ cwd: tmpDir });
      const result = mgr.execBuiltin({ builtin: true, action: 'cd', args: 'subdir' });
      assert.strictEqual(result.handled, true);
      assert.ok(result.output.includes(subDir));
      assert.strictEqual(mgr.cwd, subDir);
    });

    it('should execute pwd', () => {
      const mgr = new CwdManager({ cwd: tmpDir });
      const result = mgr.execBuiltin({ builtin: true, action: 'pwd' });
      assert.strictEqual(result.handled, true);
      assert.strictEqual(result.output, tmpDir);
    });

    it('should handle cd to non-existent dir', () => {
      const mgr = new CwdManager({ cwd: tmpDir });
      const result = mgr.execBuiltin({ builtin: true, action: 'cd', args: '/nonexistent' });
      assert.strictEqual(result.handled, true);
      assert.strictEqual(result.isError, true);
    });
  });

  describe('exportState and importState', () => {
    it('should export and import state', () => {
      const mgr1 = new CwdManager({ cwd: tmpDir });
      mgr1.cd(subDir);
      const state = mgr1.exportState();

      const mgr2 = new CwdManager({ cwd: tmpDir });
      mgr2.importState(state);
      assert.strictEqual(mgr2.cwd, subDir);
    });
  });

  describe('ls', () => {
    it('should list directory contents', () => {
      const mgr = new CwdManager({ cwd: tmpDir });
      const entries = mgr.ls();
      const names = entries.map(e => e.name);
      assert.ok(names.includes('subdir'));
      assert.ok(names.includes('file.txt'));
    });

    it('should show entry types', () => {
      const mgr = new CwdManager({ cwd: tmpDir });
      const entries = mgr.ls();
      const subdirEntry = entries.find(e => e.name === 'subdir');
      const fileEntry = entries.find(e => e.name === 'file.txt');
      assert.strictEqual(subdirEntry.isDirectory, true);
      assert.strictEqual(fileEntry.isFile, true);
    });
  });
});
