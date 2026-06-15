#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const WELCOME = path.join(__dirname, 'src/commands/cli-101-training/welcome.js');

function loadWelcomeCommand(overrides = {}) {
  const source = fs.readFileSync(WELCOME, 'utf8');
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
      if (name === '@oclif/core') {
        return { Command: class Command { log() {} } };
      }
      if (name === 'chalk') {
        const passthrough = value => String(value);
        return {
          bold: passthrough,
          underline: { bold: passthrough }
        };
      }
      if (name === 'inquirer') {
        return overrides.inquirer || { prompt: async () => ({ name: '' }) };
      }
      return require(name);
    }
  };

  vm.runInNewContext(source, sandbox, { filename: WELCOME });
  return module.exports;
}

async function main() {
  const { formatLearnerName } = loadWelcomeCommand();

  assert.strictEqual(formatLearnerName(null), 'there');
  assert.strictEqual(formatLearnerName(' Alice '), 'Alice');
  assert.strictEqual(formatLearnerName('A\u0000B\nC'), 'ABC');
  assert.strictEqual(formatLearnerName('\u202Eevil\u2066'), 'evil');
  assert.strictEqual(formatLearnerName('A\u009BB'), 'AB');
  assert.strictEqual(formatLearnerName('zero\u200Dwidth'), 'zerowidth');
  assert.strictEqual(formatLearnerName('line\u2028separator'), 'lineseparator');
  assert.strictEqual(formatLearnerName('paragraph\u2029separator'), 'paragraphseparator');
  assert.strictEqual(formatLearnerName('x'.repeat(100)).length, 80);
  const codePointBoundaryName = `${'x'.repeat(79)}😀trailing`;
  assert.strictEqual(formatLearnerName(codePointBoundaryName), `${'x'.repeat(79)}😀`);
  assert.strictEqual(Array.from(formatLearnerName('😀'.repeat(100))).length, 80);

  const Welcome = loadWelcomeCommand({
    inquirer: { prompt: async () => ({ name: ' A\u0000lice ' }) }
  });
  const command = new Welcome();
  const output = [];
  command.log = value => output.push(value === undefined ? '' : String(value));
  await command.run();
  assert.ok(output.includes('Hello Alice! Thanks for taking 101 training today.'));

  const SeparatorWelcome = loadWelcomeCommand({
    inquirer: { prompt: async () => ({ name: 'Line\u2028and\u2029paragraph' }) }
  });
  const separatorCommand = new SeparatorWelcome();
  const separatorOutput = [];
  separatorCommand.log = value => separatorOutput.push(value === undefined ? '' : String(value));
  await separatorCommand.run();
  assert.ok(separatorOutput.includes('Hello Lineandparagraph! Thanks for taking 101 training today.'));
  assert.ok(separatorOutput.every(line => !/[\u2028\u2029]/u.test(line)));

  console.log('welcome name formatting tests passed.');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
