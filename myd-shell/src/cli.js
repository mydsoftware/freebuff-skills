#!/usr/bin/env node

/**
 * MYD Shell — Interactive CLI
 *
 * An interactive shell that demonstrates:
 * 1. Virtual CWD (cd works properly)
 * 2. Long-running process support (npm run dev, etc.)
 * 3. Real-time output streaming
 * 4. Built-in commands
 *
 * Usage:
 *   myd-shell                  # Interactive mode
 *   myd-shell -c "ls -la"     # Run single command
 *   myd-shell --cwd /path     # Start in specific directory
 */

const readline = require('readline');
const os = require('os');
const path = require('path');
const { Shell } = require('./index');

// Parse CLI arguments
const args = process.argv.slice(2);
let startCwd = process.cwd();
let singleCommand = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--cwd' && args[i + 1]) {
    startCwd = path.resolve(args[i + 1]);
    i++;
  } else if (args[i] === '-c' && args[i + 1]) {
    singleCommand = args[i + 1];
    i++;
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log(`
MYD Shell — Interactive Shell with Virtual CWD

Usage:
  myd-shell                  Interactive mode
  myd-shell -c "command"     Run single command
  myd-shell --cwd /path      Start in specific directory

Built-in Commands:
  cd <dir>                   Change directory
  cd -                       Go to previous directory
  cd ~                       Go to home directory
  pwd                        Print working directory
  history                    Show command history
  procs                      List running processes
  kill <id>                  Kill a process
  clear                      Clear screen
  exit                       Exit shell

Features:
  • cd changes directory for ALL subsequent commands
  • Long-running commands (npm run dev) stream output in real-time
  • Press Ctrl+C to stop the current command
  • Type "exit" or Ctrl+D to quit
`);
    process.exit(0);
  }
}

// Create the shell
const shell = new Shell({ cwd: startCwd });

// Track current async process
let currentProcess = null;

function getPrompt() {
  const dir = shell.cwd;
  const home = os.homedir();
  const displayDir = dir.startsWith(home) ? '~' + dir.slice(home.length) : dir;
  return `\x1b[36mmyd-shell\x1b[0m:\x1b[33m${displayDir}\x1b[0m$ `;
}

function printOutput(output) {
  if (!output) return;
  const lines = output.split('\n');
  for (const line of lines) {
    if (line.startsWith('❌')) {
      console.log(`\x1b[31m${line}\x1b[0m`);
    } else if (line.startsWith('📂')) {
      console.log(`\x1b[32m${line}\x1b[0m`);
    } else {
      console.log(line);
    }
  }
}

/** Run a single command */
function runCommand(input) {
  const trimmed = input.trim();
  if (!trimmed) return;

  // Handle special CLI commands
  if (trimmed === 'history') {
    const hist = shell.history;
    hist.forEach((entry, i) => {
      const cmd = entry.command || entry;
      console.log(`  ${i + 1}  ${cmd}`);
    });
    return;
  }

  if (trimmed === 'procs') {
    const procs = shell.runningProcesses;
    if (procs.length === 0) {
      console.log('No running processes');
    } else {
      console.log('Running processes:');
      procs.forEach(p => {
        console.log(`  ${p.id}  ${p.command}  (pid: ${p.pid || '?'})`);
      });
    }
    return;
  }

  if (trimmed.startsWith('kill ')) {
    const id = trimmed.slice(5).trim();
    if (shell.stopProcess(id)) {
      console.log(`Killed ${id}`);
    } else {
      console.log(`Process not found: ${id}`);
    }
    return;
  }

  if (trimmed === 'clear') {
    process.stdout.write('\x1b[2J\x1b[H');
    return;
  }

  if (trimmed === 'exit') {
    shell.destroy();
    process.exit(0);
  }

  // Run the command asynchronously for real-time output
  const result = shell.exec(trimmed, { async: true });

  // If it's a built-in (handled synchronously)
  if (result.handled) {
    printOutput(result.output);
    return;
  }

  // It's a ProcessHandle — stream output
  currentProcess = result;

  result.on('output', (chunk, stream) => {
    if (stream === 'stderr') {
      process.stderr.write(chunk);
    } else {
      process.stdout.write(chunk);
    }
  });

  result.on('exit', (code) => {
    currentProcess = null;
    if (code !== 0 && code !== null) {
      // Don't print error for Ctrl+C
      if (code !== 130) {
        console.log(`\n\x1b[31m[exit ${code}]\x1b[0m`);
      }
    }
  });

  result.on('error', (err) => {
    currentProcess = null;
    console.error(`\x1b[31mError: ${err.message}\x1b[0m`);
  });

  result.on('timeout', (ms) => {
    currentProcess = null;
    console.log(`\n\x1b[31m[timeout after ${ms}s]\x1b[0m`);
  });
}

/** Single command mode */
if (singleCommand) {
  runCommand(singleCommand);
  if (currentProcess) {
    currentProcess.wait().then(() => process.exit());
  } else {
    process.exit(0);
  }
} else {
  // Interactive mode
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: getPrompt(),
    historySize: 100,
  });

  // Handle Ctrl+C — kill current process, don't exit
  rl.on('SIGINT', () => {
    if (currentProcess) {
      console.log('\n^C');
      currentProcess.kill('SIGINT');
    } else {
      console.log('\n(type "exit" to quit)');
    }
    rl.prompt();
  });

  // Handle Ctrl+D — exit
  rl.on('close', () => {
    shell.destroy();
    process.exit(0);
  });

  // Update prompt when CWD changes
  shell.on('cd', () => {
    rl.setPrompt(getPrompt());
  });

  console.log(`\x1b[32mMYD Shell v1.0.0\x1b[0m`);
  console.log(`Type \x1b[33mhelp\x1b[0m for commands, \x1b[33mexit\x1b[0m to quit\n`);
  rl.prompt();

  rl.on('line', (line) => {
    runCommand(line);
    // Update prompt (CWD might have changed)
    rl.setPrompt(getPrompt());
    rl.prompt();
  });
}
