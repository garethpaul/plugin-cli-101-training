#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const WELCOME = process.env.WELCOME_SOURCE ||
  path.join(__dirname, 'src/commands/cli-101-training/welcome.js');

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
  const { boundLearnerNameInput, formatLearnerName } = loadWelcomeCommand();

  assert.ok(Array.from(boundLearnerNameInput('x'.repeat(100000))).length <= 320);
  assert.ok(Buffer.byteLength(boundLearnerNameInput('😀'.repeat(100000)), 'utf8') <= 1024);

  const oversizedSingleGrapheme = `A${'\u0301'.repeat(100000)}`;
  const boundedSingleGrapheme = formatLearnerName(oversizedSingleGrapheme);
  assert.ok(
    Buffer.byteLength(boundedSingleGrapheme, 'utf8') <= 1024,
    'one grapheme must not produce unbounded UTF-8 output'
  );
  assert.ok(
    Array.from(boundedSingleGrapheme).length <= 160,
    'one grapheme must not produce unbounded code-point output'
  );

  const hiddenPrefix = `${'\u200D'.repeat(100000)}Alice`;
  assert.strictEqual(
    formatLearnerName(hiddenPrefix),
    'there',
    'an oversized raw control prefix must not be scanned away to reveal an unbounded tail'
  );
  assert.strictEqual(formatLearnerName(`${'\u200D'.repeat(200)}Alice`), 'Alice');

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
  const flagBoundaryName = `${'x'.repeat(79)}🇺🇸trailing`;
  assert.strictEqual(formatLearnerName(flagBoundaryName), `${'x'.repeat(79)}🇺🇸`);
  const combiningBoundaryName = `${'x'.repeat(79)}e\u0301trailing`;
  assert.strictEqual(formatLearnerName(combiningBoundaryName), `${'x'.repeat(79)}e\u0301`);

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

  const unsafePromptOutput = [];
  const unsafePromptInput = 'A\u009D2;PWN\u009CB';
  const PromptSafeWelcome = loadWelcomeCommand({
    inquirer: {
      prompt: async questions => {
        const [question] = questions;
        const displayed = question.transformer
          ? question.transformer(unsafePromptInput, {}, { isFinal: false })
          : unsafePromptInput;
        unsafePromptOutput.push(displayed);
        return {
          name: question.filter
            ? await question.filter(unsafePromptInput)
            : unsafePromptInput
        };
      }
    }
  });
  const promptSafeCommand = new PromptSafeWelcome();
  promptSafeCommand.log = value => unsafePromptOutput.push(value === undefined ? '' : String(value));
  await promptSafeCommand.run();
  assert.ok(!unsafePromptOutput.join('\n').includes(unsafePromptInput));
  assert.ok(unsafePromptOutput.every(line => !/[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u.test(line)));

  const boundedPromptTransforms = [];
  const boundedPromptOutput = [];
  const PromptBoundWelcome = loadWelcomeCommand({
    inquirer: {
      prompt: async questions => {
        const [question] = questions;
        boundedPromptTransforms.push(question.transformer(hiddenPrefix, {}, { isFinal: false }));
        return { name: await question.filter(hiddenPrefix) };
      }
    }
  });
  const promptBoundCommand = new PromptBoundWelcome();
  promptBoundCommand.log = value => boundedPromptOutput.push(value === undefined ? '' : String(value));
  await promptBoundCommand.run();
  assert.deepStrictEqual(boundedPromptTransforms, ['']);
  assert.ok(boundedPromptOutput.includes('Hello there! Thanks for taking 101 training today.'));

  console.log('welcome name formatting tests passed.');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
