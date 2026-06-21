#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = __dirname;
const RUN = path.join(ROOT, 'bin', 'run');
const CLI_HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'plugin-cli-oclif-home-'));
const yaml = require('./src/js-yaml-compat');

assert.strictEqual(yaml.safeLoad, yaml.load);
assert.strictEqual(yaml.safeDump, yaml.dump);
assert.strictEqual(yaml.safeLoad('enabled: true').enabled, true);
assert.match(yaml.safeDump({ enabled: true }), /enabled: true/);

function runCli(args) {
  const result = spawnSync(process.execPath, [RUN, ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    env: {
      ...process.env,
      FORCE_COLOR: '0',
      HOME: CLI_HOME,
      USERPROFILE: CLI_HOME,
      XDG_CACHE_HOME: path.join(CLI_HOME, '.cache'),
      XDG_CONFIG_HOME: path.join(CLI_HOME, '.config'),
      XDG_DATA_HOME: path.join(CLI_HOME, '.local', 'share')
    }
  });

  assert.strictEqual(result.error, undefined, result.error && result.error.message);
  assert.strictEqual(result.status, 0, result.stderr || result.stdout);
  assert.strictEqual(result.stderr, '');
  return result.stdout.replace(/\r\n/g, '\n');
}

const help = runCli(['--help']);
assert.match(help, /Twilio CLI 101 Training/);
assert.match(help, /cli-101-training/);

const feedback = runCli(['cli-101-training:feedback']);
assert.strictEqual(feedback, '>>> https://twil.io/twilio-cli-feedback\n');

const examples = runCli([
  'cli-101-training:examples',
  '--example',
  'debugger'
]);
assert.match(examples, /twilio debugger:logs:list/);
assert.match(examples, /Review before running/);
assert.match(examples, /Clipboard copy skipped/);

for (const relativePath of [
  'src/commands/cli-101-training/examples.js',
  'src/commands/cli-101-training/feedback.js',
  'src/commands/cli-101-training/welcome.js'
]) {
  const Command = require(path.join(ROOT, relativePath));
  assert.strictEqual(typeof Command, 'function', `${relativePath} must export a command class`);
  assert.strictEqual(typeof Command.prototype.run, 'function', `${relativePath} must define run()`);
}

console.log('oclif command smoke tests passed.');
