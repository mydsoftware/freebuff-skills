/**
 * MYD Shell — Process Manager
 *
 * Manages long-running processes that shouldn't terminate.
 * Unlike spawnSync, this uses async spawn with real-time output streaming.
 *
 * Features:
 * 1. Run commands asynchronously (npm run dev, servers, watchers)
 * 2. Real-time stdout/stderr streaming via events
 * 3. Process tracking with unique IDs
 * 4. Graceful and forceful termination
 * 5. Timeout support
 * 6. CWD inheritance from CwdManager
 */

const { spawn, execSync, exec } = require('child_process');
const os = require('os');
const path = require('path');
const { EventEmitter } = require('events');
const { CwdManager } = require('./cwd-manager');

/** Get the default shell for the current platform */
function getDefaultShell() {
  switch (os.platform()) {
    case 'win32':
      return process.env.COMSPEC || 'cmd.exe';
    case 'darwin':
      return process.env.SHELL || '/bin/zsh';
    default:
      return process.env.SHELL || '/bin/bash';
  }
}

/** Get shell args for the default shell */
function getShellArgs(command) {
  switch (os.platform()) {
    case 'win32':
      // cmd.exe /c "command"
      return ['/c', command];
    case 'darwin':
    default:
      // bash -l -c "command" or zsh -l -c "command"
      return ['-l', '-c', command];
  }
}

class ProcessManager {
  constructor(options = {}) {
    this._processes = new Map();
    this._cwdManager = options.cwdManager || new CwdManager();
    this._defaultTimeout = options.timeout || 300; // 5 minutes
    this._idCounter = 0;
  }

  /** Get the CWD manager */
  get cwdManager() {
    return this._cwdManager;
  }

  /**
   * Run a command asynchronously.
   * Returns a ProcessHandle with event-based output.
   *
   * @param {string} command - The shell command to run
   * @param {object} options - { cwd, env, timeout, shell }
   * @returns {ProcessHandle}
   */
  run(command, options = {}) {
    const id = `proc-${++this._idCounter}-${Date.now()}`;
    const cwd = options.cwd || this._cwdManager.cwd;
    const env = { ...process.env, ...(options.env || {}) };
    const timeout = options.timeout || this._defaultTimeout;
    const useShell = options.shell !== false;

    const shell = getDefaultShell();
    const shellArgs = useShell ? getShellArgs(command) : command.split(/\s+/);
    const file = useShell ? shell : shellArgs.shift();

    const handle = new ProcessHandle(id, command, { file, shellArgs, cwd, env, timeout });
    this._processes.set(id, handle);

    // Start the process
    handle._start();

    // Auto-remove when done
    handle.on('exit', () => {
      this._processes.delete(id);
    });

    return handle;
  }

  /**
   * Run a command synchronously (blocks until done).
   * Use this for quick commands. For long-running, use run().
   *
   * @param {string} command - The shell command to run
   * @param {object} options - { cwd, env, timeout }
   * @returns {{ stdout: string, stderr: string, exitCode: number, output: string }}
   */
  runSync(command, options = {}) {
    const cwd = options.cwd || this._cwdManager.cwd;
    const env = { ...process.env, ...(options.env || {}) };
    const timeout = (options.timeout || 60) * 1000;

    try {
      const result = execSync(command, {
        cwd,
        env,
        timeout,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
        maxBuffer: 10 * 1024 * 1024, // 10MB
        windowsHide: true,
      });
      return { stdout: result, stderr: '', exitCode: 0, output: result };
    } catch (err) {
      return {
        stdout: err.stdout || '',
        stderr: err.stderr || err.message,
        exitCode: err.status || 1,
        output: (err.stdout || '') + (err.stderr || err.message),
      };
    }
  }

  /**
   * Execute a full command (handles built-ins + shell execution).
   * This is the main entry point for running user commands.
   *
   * @param {string} command - The command to execute
   * @param {object} options - { async: false, cwd, env, timeout }
   * @returns {{ handled: boolean, process?: ProcessHandle, output?: string, isError?: boolean }}
   */
  exec(command, options = {}) {
    const parsed = this._cwdManager.parseCommand(command);

    // Handle built-in commands (cd, pwd, etc.)
    if (parsed.builtin) {
      const result = this._cwdManager.execBuiltin(parsed);
      return { handled: true, ...result };
    }

    // For shell commands
    if (options.async) {
      const proc = this.run(command, options);
      return { handled: false, process: proc };
    }

    // Synchronous execution
    const result = this.runSync(command, options);
    return {
      handled: false,
      output: result.output,
      exitCode: result.exitCode,
      isError: result.exitCode !== 0,
    };
  }

  /** Get all running processes */
  list() {
    return Array.from(this._processes.values()).map(p => p.info);
  }

  /** Get a process by ID */
  get(id) {
    return this._processes.get(id) || null;
  }

  /** Kill a process by ID */
  kill(id, signal = 'SIGTERM') {
    const proc = this._processes.get(id);
    if (!proc) return false;
    proc.kill(signal);
    return true;
  }

  /** Kill all running processes */
  killAll(signal = 'SIGTERM') {
    for (const [, proc] of this._processes) {
      proc.kill(signal);
    }
  }
}


/**
 * Represents a running process with event-based output.
 */
class ProcessHandle extends EventEmitter {
  constructor(id, command, options) {
    super();
    this.id = id;
    this.command = command;
    this._options = options;
    this._process = null;
    this._startTime = null;
    this._endTime = null;
    this._exitCode = null;
    this._signal = null;
    this._killed = false;
    this._stdout = '';
    this._stderr = '';
    this._timeout = options.timeout;
    this._timer = null;
  }

  /** Get process info */
  get info() {
    return {
      id: this.id,
      command: this.command,
      pid: this._process?.pid,
      cwd: this._options.cwd,
      startTime: this._startTime,
      running: this._process !== null && this._exitCode === null,
      exitCode: this._exitCode,
      killed: this._killed,
    };
  }

  /** Get accumulated stdout */
  get stdout() { return this._stdout; }

  /** Get accumulated stderr */
  get stderr() { return this._stderr; }

  /** Get exit code (null if still running) */
  get exitCode() { return this._exitCode; }

  /** Whether the process is still running */
  get running() {
    return this._process !== null && this._exitCode === null;
  }

  /** Start the process */
  _start() {
    const { file, shellArgs, cwd, env } = this._options;

    try {
      this._process = spawn(file, shellArgs, {
        cwd,
        env,
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
      });
    } catch (err) {
      this._exitCode = 1;
      this._stderr = err.message;
      this._endTime = Date.now();
      this.emit('error', err);
      this.emit('exit', this._exitCode, null);
      return;
    }

    this._startTime = Date.now();

    // Set up timeout
    if (this._timeout && this._timeout > 0) {
      this._timer = setTimeout(() => {
        this.kill('SIGTERM');
        this.emit('timeout', this._timeout);
      }, this._timeout * 1000);
    }

    // Stream stdout
    this._process.stdout.on('data', (data) => {
      const chunk = data.toString();
      this._stdout += chunk;
      this.emit('stdout', chunk);
      this.emit('output', chunk, 'stdout');
    });

    // Stream stderr
    this._process.stderr.on('data', (data) => {
      const chunk = data.toString();
      this._stderr += chunk;
      this.emit('stderr', chunk);
      this.emit('output', chunk, 'stderr');
    });

    // Process exit
    this._process.on('exit', (code, signal) => {
      this._exitCode = code;
      this._signal = signal;
      this._endTime = Date.now();
      if (this._timer) clearTimeout(this._timer);
      this.emit('exit', code, signal);
    });

    // Process error
    this._process.on('error', (err) => {
      this._exitCode = 1;
      this._stderr = err.message;
      this._endTime = Date.now();
      if (this._timer) clearTimeout(this._timer);
      this.emit('error', err);
    });

    this.emit('start', { pid: this._process.pid, command: this.command });
  }

  /**
   * Kill the process (and its tree on Windows).
   * @param {'SIGTERM'|'SIGKILL'|'SIGINT'} signal
   */
  kill(signal = 'SIGTERM') {
    this._killed = true;
    if (this._timer) clearTimeout(this._timer);

    if (this._process && this._exitCode === null) {
      const pid = this._process.pid;
      if (os.platform() === 'win32' && pid) {
        // On Windows, kill the entire process tree using taskkill
        try {
          execSync(`taskkill /F /T /PID ${pid}`, { windowsHide: true, stdio: 'ignore' });
        } catch {
          // Fallback: try direct kill
          try { this._process.kill('SIGKILL'); } catch {}
        }
      } else {
        try {
          this._process.kill(signal);
        } catch {
          // Process already dead
        }

        // Force kill after 2 seconds if still alive
        if (signal !== 'SIGKILL') {
          setTimeout(() => {
            if (this._exitCode === null) {
              try { this._process.kill('SIGKILL'); } catch {}
            }
          }, 2000);
        }
      }
    }
  }

  /**
   * Write to the process stdin.
   * @param {string} data
   */
  write(data) {
    if (this._process && this._process.stdin && !this._process.stdin.destroyed) {
      this._process.stdin.write(data);
      return true;
    }
    return false;
  }

  /**
   * Close stdin (sends EOF).
   */
  closeStdin() {
    if (this._process && this._process.stdin && !this._process.stdin.destroyed) {
      this._process.stdin.end();
    }
  }

  /**
   * Wait for the process to finish.
   * @returns {Promise<{ exitCode: number, stdout: string, stderr: string }>}
   */
  wait() {
    return new Promise((resolve) => {
      if (this._exitCode !== null) {
        resolve({ exitCode: this._exitCode, stdout: this._stdout, stderr: this._stderr });
        return;
      }
      this.on('exit', (code) => {
        resolve({ exitCode: code, stdout: this._stdout, stderr: this._stderr });
      });
    });
  }

  /** Duration in milliseconds */
  get duration() {
    if (!this._startTime) return 0;
    const end = this._endTime || Date.now();
    return end - this._startTime;
  }
}

module.exports = { ProcessManager, ProcessHandle, getDefaultShell };
