/**
 * MYD Shell — Main Shell Class
 *
 * A unified shell interface that properly handles:
 * 1. Virtual CWD (cd works across commands)
 * 2. Long-running processes (npm run dev, servers)
 * 3. Real-time output streaming
 * 4. Built-in commands (cd, pwd, ls, etc.)
 * 5. Process lifecycle management
 *
 * Usage:
 *   const shell = new Shell({ cwd: '/my/project' });
 *
 *   // Synchronous (quick commands)
 *   const result = shell.execSync('ls -la');
 *
 *   // Async (long-running commands)
 *   const proc = shell.execAsync('npm run dev');
 *   proc.on('stdout', chunk => process.stdout.write(chunk));
 *   proc.on('stderr', chunk => process.stderr.write(chunk));
 *   proc.on('exit', code => console.log('Done:', code));
 *
 *   // Built-in commands
 *   shell.exec('cd /some/dir');  // Changes virtual CWD
 *   shell.exec('pwd');           // Shows current CWD
 */

const os = require('os');
const path = require('path');
const fs = require('fs');
const { EventEmitter } = require('events');
const { CwdManager } = require('./cwd-manager');
const { ProcessManager, ProcessHandle } = require('./process-manager');

class Shell extends EventEmitter {
  constructor(options = {}) {
    super();
    // Resolve to real path on Windows (fixes short-name paths like ADMINI~1)
    let startCwd = options.cwd || process.cwd();
    try { startCwd = fs.realpathSync(startCwd); } catch {}
    this._cwdManager = new CwdManager({ cwd: startCwd });
    this._processManager = new ProcessManager({
      cwdManager: this._cwdManager,
      timeout: options.timeout || 300,
    });
    this._history = [];
    this._maxHistory = options.maxHistory || 100;
    this._env = { ...process.env, ...(options.env || {}) };

    // Forward CWD change events
    this._cwdManager.on('cd', (data) => this.emit('cd', data));
  }

  /** Get the current working directory */
  get cwd() {
    return this._cwdManager.cwd;
  }

  /** Get the CWD manager */
  get cwdManager() {
    return this._cwdManager;
  }

  /** Get the process manager */
  get processManager() {
    return this._processManager;
  }

  /** Get command history */
  get history() {
    return [...this._history];
  }

  /** Get all running processes */
  get runningProcesses() {
    return this._processManager.list();
  }

  /**
   * Change directory (built-in).
   * @param {string} target - Directory path, ~, -, or relative path
   * @returns {{ success: boolean, cwd?: string, error?: string }}
   */
  cd(target) {
    return this._cwdManager.cd(target);
  }

  /**
   * Execute a command synchronously.
   * Built-ins (cd, pwd) are handled internally.
   * Shell commands block until completion.
   *
   * @param {string} command - Command to execute
   * @param {object} options - { cwd, env, timeout }
   * @returns {{ output: string, exitCode: number, isError: boolean }}
   */
  execSync(command, options = {}) {
    const parsed = this._cwdManager.parseCommand(command);
    const result = { output: '', exitCode: 0, isError: false };

    // Handle built-ins
    if (parsed.builtin) {
      const builtinResult = this._cwdManager.execBuiltin(parsed);
      result.output = builtinResult.output || '';
      result.isError = builtinResult.isError || false;
      result.exitCode = builtinResult.isError ? 1 : 0;

      this._addToHistory(command, result);
      return result;
    }

    // Run shell command synchronously
    const syncResult = this._processManager.runSync(command, {
      cwd: options.cwd || this._cwdManager.cwd,
      env: { ...this._env, ...(options.env || {}) },
      timeout: options.timeout || 60,
    });

    result.output = syncResult.output;
    result.exitCode = syncResult.exitCode;
    result.isError = syncResult.exitCode !== 0;

    this._addToHistory(command, result);
    return result;
  }

  /**
   * Execute a command asynchronously.
   * Returns a ProcessHandle with real-time output events.
   *
   * Built-ins are handled synchronously and return { output, handled: true }.
   * Shell commands return a ProcessHandle with events.
   *
   * @param {string} command - Command to execute
   * @param {object} options - { cwd, env, timeout }
   * @returns {ProcessHandle | { output: string, handled: true }}
   */
  execAsync(command, options = {}) {
    const parsed = this._cwdManager.parseCommand(command);

    // Handle built-ins
    if (parsed.builtin) {
      const builtinResult = this._cwdManager.execBuiltin(parsed);
      return {
        output: builtinResult.output || '',
        handled: true,
        isError: builtinResult.isError || false,
      };
    }

    // Run shell command asynchronously
    const proc = this._processManager.run(command, {
      cwd: options.cwd || this._cwdManager.cwd,
      env: { ...this._env, ...(options.env || {}) },
      timeout: options.timeout,
    });

    // Track in history
    const historyEntry = { command, startTime: Date.now(), processId: proc.id, async: true };
    this._history.push(historyEntry);
    if (this._history.length > this._maxHistory) this._history.shift();

    proc.on('exit', (code) => {
      historyEntry.endTime = Date.now();
      historyEntry.exitCode = code;
    });

    return proc;
  }

  /**
   * Execute a command (smart mode).
   * Automatically chooses sync/async based on a heuristic or explicit option.
   *
   * @param {string} command - Command to execute
   * @param {object} options - { async: false, cwd, env, timeout }
   * @returns {ProcessHandle | { output: string, exitCode: number, isError: boolean }}
   */
  exec(command, options = {}) {
    return this._processManager.exec(command, {
      ...options,
      cwd: options.cwd || this._cwdManager.cwd,
    });
  }

  /**
   * Stop a running process by ID.
   */
  stopProcess(id, signal = 'SIGTERM') {
    return this._processManager.kill(id, signal);
  }

  /**
   * Stop all running processes.
   */
  stopAllProcesses(signal = 'SIGTERM') {
    this._processManager.killAll(signal);
  }

  /**
   * Get a running process by ID.
   */
  getProcess(id) {
    return this._processManager.get(id);
  }

  /**
   * Set environment variables.
   */
  setEnv(key, value) {
    this._env[key] = value;
    process.env[key] = value;
  }

  /**
   * Get environment variables.
   */
  getEnv(key) {
    return key ? this._env[key] : { ...this._env };
  }

  /**
   * Export shell state for persistence.
   */
  exportState() {
    return {
      cwd: this._cwdManager.cwd,
      prevCwd: this._cwdManager.prevCwd,
      history: this._cwdManager.history,
      env: this._env,
    };
  }

  /**
   * Import shell state from persistence.
   */
  importState(state) {
    if (state.cwd) this._cwdManager.importState({ cwd: state.cwd });
    if (state.prevCwd) this._cwdManager._prevCwd = state.prevCwd;
    if (Array.isArray(state.history)) this._cwdManager._history = state.history;
    if (state.env) Object.assign(this._env, state.env);
  }

  /**
   * Clean up all processes and resources.
   */
  destroy() {
    this.stopAllProcesses();
    this.removeAllListeners();
  }

  _addToHistory(command, result) {
    const entry = {
      command,
      output: result.output,
      exitCode: result.exitCode,
      isError: result.isError,
      timestamp: Date.now(),
    };
    this._history.push(entry);
    if (this._history.length > this._maxHistory) this._history.shift();
  }
}

module.exports = { Shell, CwdManager, ProcessManager, ProcessHandle };
