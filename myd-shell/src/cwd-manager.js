/**
 * MYD Shell — Virtual CWD Manager
 *
 * In desktop apps and Electron, there's no real "current working directory"
 * like in a terminal. This module provides a virtual CWD that:
 *
 * 1. Tracks the current directory across commands
 * 2. Resolves relative paths correctly
 * 3. Handles quoted paths, ~ expansion, - (previous dir)
 * 4. Persists across process restarts (optional)
 * 5. Supports platform-specific path handling (Windows/Unix)
 */

const os = require('os');
const path = require('path');
const fs = require('fs');

class CwdManager {
  constructor(options = {}) {
    let startCwd = options.cwd || process.cwd();
    try { startCwd = fs.realpathSync(startCwd); } catch {}
    this._cwd = startCwd;
    this._prevCwd = null;
    this._history = [this._cwd];
    this._historyIndex = 0;
    this._maxHistory = options.maxHistory || 50;
    this._listeners = [];
  }

  /** Get the current working directory */
  get cwd() {
    return this._cwd;
  }

  /** Get the previous working directory */
  get prevCwd() {
    return this._prevCwd;
  }

  /** Get the full directory history */
  get history() {
    return [...this._history];
  }

  /**
   * Change directory.
   * Supports:
   *   cd /path/to/dir
   *   cd relative/path
   *   cd ~ or cd ~/something
   *   cd - (go to previous directory)
   *   cd (go to home directory)
   *   cd "path with spaces"
   */
  cd(target) {
    // No argument = go home
    if (!target || target.trim() === '') {
      return this._changeTo(os.homedir());
    }

    target = target.trim();

    // Remove surrounding quotes if present
    if ((target.startsWith('"') && target.endsWith('"')) ||
        (target.startsWith("'") && target.endsWith("'"))) {
      target = target.slice(1, -1);
    }

    // "-" = previous directory
    if (target === '-') {
      if (!this._prevCwd) {
        return { success: false, error: 'No previous directory' };
      }
      return this._changeTo(this._prevCwd);
    }

    // "~" = home directory
    if (target === '~' || target.startsWith('~/') || target.startsWith('~\\')) {
      target = target.replace(/^~/, os.homedir());
    }

    // Resolve relative to current CWD
    let resolved;
    if (path.isAbsolute(target)) {
      resolved = target;
    } else {
      resolved = path.resolve(this._cwd, target);
    }

    // Normalize the path (resolves .., ., etc.)
    resolved = path.normalize(resolved);

    return this._changeTo(resolved);
  }

  /** Internal: change to a resolved path */
  _changeTo(targetDir) {
    try {
      const stat = fs.statSync(targetDir);
      if (!stat.isDirectory()) {
        return { success: false, error: `Not a directory: ${targetDir}` };
      }
    } catch (err) {
      return { success: false, error: `Directory not found: ${targetDir}` };
    }

    this._prevCwd = this._cwd;
    this._cwd = targetDir;

    // Update history
    this._history.push(targetDir);
    if (this._history.length > this._maxHistory) {
      this._history.shift();
    }
    this._historyIndex = this._history.length - 1;

    // Notify listeners
    this._emit('cd', { from: this._prevCwd, to: this._cwd });

    return { success: true, cwd: this._cwd };
  }

  /**
   * Resolve a path relative to the current CWD.
   * Does NOT change directory — just resolves.
   */
  resolve(target) {
    if (!target) return this._cwd;
    target = target.trim();

    // Remove quotes
    if ((target.startsWith('"') && target.endsWith('"')) ||
        (target.startsWith("'") && target.endsWith("'"))) {
      target = target.slice(1, -1);
    }

    // ~ expansion
    if (target.startsWith('~')) {
      target = target.replace(/^~/, os.homedir());
    }

    if (path.isAbsolute(target)) {
      return path.normalize(target);
    }
    return path.resolve(this._cwd, target);
  }

  /**
   * Check if a path exists and is a directory.
   */
  isDirectory(target) {
    try {
      const resolved = this.resolve(target);
      const stat = fs.statSync(resolved);
      return stat.isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * Check if a path exists.
   */
  exists(target) {
    try {
      const resolved = this.resolve(target);
      fs.statSync(resolved);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get directory listing for a path (or current dir).
   */
  ls(dirPath) {
    const target = dirPath ? this.resolve(dirPath) : this._cwd;
    try {
      const entries = fs.readdirSync(target, { withFileTypes: true });
      return entries.map(e => ({
        name: e.name,
        isDirectory: e.isDirectory(),
        isFile: e.isFile(),
        isSymlink: e.isSymbolicLink(),
      }));
    } catch {
      return [];
    }
  }

  /**
   * Parse a shell command to detect if it's a built-in (like cd).
   * Returns { builtin: true, action: 'cd', args: [...] } or { builtin: false, command: '...' }
   */
  parseCommand(command) {
    const trimmed = command.trim();
    if (!trimmed) return { builtin: true, action: 'empty' };

    // Extract the first word
    const parts = trimmed.match(/^(\S+)(?:\s+(.*))?$/);
    if (!parts) return { builtin: false, command: trimmed };

    const cmd = parts[1].toLowerCase();
    const args = parts[2] || '';

    switch (cmd) {
      case 'cd':
        return { builtin: true, action: 'cd', args: args.trim() };
      case 'pwd':
        return { builtin: true, action: 'pwd' };
      case 'pushd':
        return { builtin: true, action: 'pushd', args: args.trim() };
      case 'popd':
        return { builtin: true, action: 'popd' };
      case 'dirs':
        return { builtin: true, action: 'dirs' };
      default:
        return { builtin: false, command: trimmed };
    }
  }

  /**
   * Execute a built-in command.
   * Returns { handled: true, output: '...' } or { handled: false }
   */
  execBuiltin(parsed) {
    if (!parsed.builtin) return { handled: false };

    switch (parsed.action) {
      case 'empty':
        return { handled: true, output: '' };

      case 'cd': {
        const result = this.cd(parsed.args);
        if (result.success) {
          return { handled: true, output: `📂 ${result.cwd}` };
        }
        return { handled: true, output: `❌ ${result.error}`, isError: true };
      }

      case 'pwd':
        return { handled: true, output: this._cwd };

      case 'pushd': {
        const result = this.cd(parsed.args);
        if (result.success) {
          return { handled: true, output: `📂 ${result.cwd}\nStack: ${this._history.join(' ')}` };
        }
        return { handled: true, output: `❌ ${result.error}`, isError: true };
      }

      case 'popd': {
        const result = this.cd('-');
        if (result.success) {
          return { handled: true, output: `📂 ${result.cwd}` };
        }
        return { handled: true, output: `❌ ${result.error}`, isError: true };
      }

      case 'dirs':
        return { handled: true, output: this._history.join(' ') };

      default:
        return { handled: false };
    }
  }

  /** Subscribe to CWD changes */
  on(event, listener) {
    this._listeners.push({ event, listener });
    return () => {
      this._listeners = this._listeners.filter(l => l !== listener);
    };
  }

  _emit(event, data) {
    for (const l of this._listeners) {
      if (l.event === event) l.listener(data);
    }
  }

  /** Export state for persistence */
  exportState() {
    return {
      cwd: this._cwd,
      prevCwd: this._prevCwd,
      history: this._history,
    };
  }

  /** Import state from persistence */
  importState(state) {
    if (state.cwd && fs.existsSync(state.cwd)) {
      this._cwd = state.cwd;
    }
    if (state.prevCwd) this._prevCwd = state.prevCwd;
    if (Array.isArray(state.history)) this._history = state.history;
  }
}

module.exports = { CwdManager };
