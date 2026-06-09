#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const WELCOME = path.join(__dirname, 'src/commands/cli-101-training/welcome.js');

function loadWelcomeCommand() {
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
      if (name === '@oclif/command') {
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
        return { prompt: async () => ({ name: '' }) };
      }
      return require(name);
    }
  };

  vm.runInNewContext(source, sandbox, { filename: WELCOME });
  return module.exports;
}

const { formatLearnerName } = loadWelcomeCommand();

assert.strictEqual(formatLearnerName(null), 'there');
assert.strictEqual(formatLearnerName(' Alice '), 'Alice');
assert.strictEqual(formatLearnerName('A\u0000B\nC'), 'ABC');
assert.strictEqual(formatLearnerName('\u202Eevil\u2066'), 'evil');
assert.strictEqual(formatLearnerName('x'.repeat(100)).length, 80);

console.log('welcome name formatting tests passed.');
