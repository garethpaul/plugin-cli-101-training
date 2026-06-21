#!/usr/bin/env node
'use strict';

const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const BASELINE = 'scripts/check-baseline.js';
const TESTS = Object.freeze([
  'test_audit_policy.js',
  'test_welcome_name_format.js',
  'test_examples_catalog.js',
  'test_oclif_commands.js',
  'test_repository_gate.js'
]);
const COMMANDS = Object.freeze({
  check: Object.freeze([BASELINE]),
  lint: Object.freeze([BASELINE]),
  build: Object.freeze([BASELINE]),
  test: Object.freeze([BASELINE, ...TESTS])
});

function scriptPath(relativePath) {
  const resolved = path.resolve(ROOT, relativePath);
  if (!resolved.startsWith(`${ROOT}${path.sep}`)) {
    throw new Error(`refusing to run script outside repository: ${relativePath}`);
  }
  return resolved;
}

function runScript(relativePath) {
  const result = spawnSync(process.execPath, [scriptPath(relativePath)], {
    cwd: ROOT,
    env: process.env,
    stdio: 'inherit',
    shell: false
  });

  if (result.error) throw result.error;
  return typeof result.status === 'number' ? result.status : 1;
}

function runGate(command) {
  const scripts = COMMANDS[command];
  if (!scripts) {
    throw new Error(`unknown repository gate command: ${command}`);
  }

  for (const script of scripts) {
    const status = runScript(script);
    if (status !== 0) return status;
  }
  return 0;
}

function main(argv = process.argv.slice(2)) {
  const command = argv[0] || 'check';
  if (argv.length > 1) {
    throw new Error(`unexpected repository gate arguments: ${argv.slice(1).join(' ')}`);
  }
  return runGate(command);
}

if (require.main === module) {
  try {
    process.exitCode = main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { COMMANDS, ROOT, main, runGate, scriptPath };
