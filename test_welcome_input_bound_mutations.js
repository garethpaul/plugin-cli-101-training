#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = __dirname;
const SOURCE = path.join(ROOT, 'src/commands/cli-101-training/welcome.js');
const TEST = path.join(ROOT, 'test_welcome_name_format.js');

const mutations = [
  [
    'formatter raw bound',
    'const boundedInput = boundLearnerNameInput(rawName);\n  const name =',
    'const boundedInput = rawName;\n  const name ='
  ],
  [
    'prompt raw bound',
    'const boundedInput = boundLearnerNameInput(rawName);\n  return truncateLearnerName',
    'const boundedInput = rawName;\n  return truncateLearnerName'
  ],
  [
    'raw code-point cap',
    'LEARNER_NAME_MAX_INPUT_CODE_POINTS = 320',
    'LEARNER_NAME_MAX_INPUT_CODE_POINTS = 1000000'
  ],
  [
    'raw byte cap',
    'LEARNER_NAME_MAX_INPUT_UTF8_BYTES = 1024',
    'LEARNER_NAME_MAX_INPUT_UTF8_BYTES = 10000000'
  ]
];

const source = fs.readFileSync(SOURCE, 'utf8');

for (const [label, original, replacement] of mutations) {
  assert.strictEqual(source.split(original).length - 1, 1, `${label}: mutation target must be unique`);
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'plugin-cli-name-bound-'));
  const mutatedSource = path.join(temporary, 'welcome.js');
  fs.writeFileSync(mutatedSource, source.replace(original, replacement));

  const result = spawnSync(process.execPath, [TEST], {
    cwd: ROOT,
    encoding: 'utf8',
    env: { ...process.env, WELCOME_SOURCE: mutatedSource }
  });
  fs.rmSync(temporary, { force: true, recursive: true });

  assert.notStrictEqual(result.status, 0, `${label}: mutation survived\n${result.stdout}${result.stderr}`);
}

console.log('welcome input-bound mutation tests passed.');
