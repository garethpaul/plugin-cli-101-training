#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const EXAMPLES = path.join(__dirname, 'src/commands/cli-101-training/examples.js');

function loadExamplesCommand(overrides = {}) {
  const source = fs.readFileSync(EXAMPLES, 'utf8');
  const module = { exports: {} };
  const sandbox = {
    Buffer,
    clearTimeout,
    console,
    module,
    process,
    setTimeout,
    exports: module.exports,
    require(name) {
      if (name === '@oclif/command') {
        return {
          Command: class Command { log() {} error(message) { throw new Error(message); } },
          flags: {
            boolean(definition) { return definition; },
            string(definition) { return definition; }
          }
        };
      }
      if (name === 'chalk') {
        return { bold: value => String(value) };
      }
      if (name === 'clipboardy') {
        return overrides.clipboardy || { writeSync() {} };
      }
      if (name === 'inquirer') {
        return { prompt: async () => ({ example: 'sms' }) };
      }
      return require(name);
    }
  };

  vm.runInNewContext(source, sandbox, { filename: EXAMPLES });
  return module.exports;
}

async function main() {
  const { getExampleCommand } = loadExamplesCommand();

  assert.strictEqual(getExampleCommand('__missing__'), null);
  assert.ok(getExampleCommand('sms').includes('+15555550100'));
  assert.ok(getExampleCommand('webhook').includes('<YOUR_TWILIO_NUMBER>'));

  const sensitiveDetail = '/Users/learner/private/clipboard.sock';
  const Examples = loadExamplesCommand({
    clipboardy: {
      writeSync() {
        throw new Error(sensitiveDetail);
      }
    }
  });
  const command = new Examples();
  const output = [];
  command.parse = () => ({ flags: { copy: true, example: 'sms' } });
  command.log = value => output.push(String(value));

  await command.run();

  assert.ok(output.includes('Clipboard copy skipped: clipboard unavailable.'));
  assert.ok(!output.join('\n').includes(sensitiveDetail));

  console.log('example catalog lookup tests passed.');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
