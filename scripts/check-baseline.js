#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PLAN = 'docs/plans/2026-06-08-plugin-cli-101-training-baseline.md';
const CLIPBOARD_PLAN = 'docs/plans/2026-06-08-plugin-cli-101-training-clipboard-opt-in.md';
const CHECK_PLAN = 'docs/plans/2026-06-08-plugin-cli-101-training-check-wrapper.md';
const WELCOME_PLAN = 'docs/plans/2026-06-09-plugin-cli-101-training-welcome-name-normalization.md';
const REQUIRED = [
  '.gitignore',
  'CHANGES.md',
  'Makefile',
  'README.md',
  'SECURITY.md',
  'VISION.md',
  'appveyor.yml',
  'bin/run',
  'bin/run.cmd',
  'docs/readme-overview.svg',
  'package.json',
  PLAN,
  CLIPBOARD_PLAN,
  CHECK_PLAN,
  WELCOME_PLAN,
  'scripts/check-baseline.js',
  'src/commands/cli-101-training/examples.js',
  'src/commands/cli-101-training/feedback.js',
  'src/commands/cli-101-training/welcome.js'
];

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function parseSource(relativePath) {
  return read(relativePath).replace(/^#![^\n]*\n/, '');
}

function failIfMissing(failures) {
  for (const file of REQUIRED) {
    if (!fs.existsSync(path.join(ROOT, file))) {
      failures.push(`required file missing: ${file}`);
    }
  }
}

function main() {
  const failures = [];
  failIfMissing(failures);

  const pkg = JSON.parse(read('package.json'));
  if (pkg.scripts.check !== 'node scripts/check-baseline.js') {
    failures.push('package.json must expose npm run check');
  }
  if (pkg.scripts.test !== 'npm run check') {
    failures.push('npm test must run the static baseline');
  }
  if (pkg.scripts.posttest) {
    failures.push('posttest should not run npm audit without a committed lockfile');
  }

  for (const jsFile of [
    'scripts/check-baseline.js',
    'src/commands/cli-101-training/examples.js',
    'src/commands/cli-101-training/feedback.js',
    'src/commands/cli-101-training/welcome.js'
  ]) {
    try {
      // eslint-disable-next-line no-new-func
      new Function(parseSource(jsFile));
    } catch (error) {
      failures.push(`${jsFile} must parse as JavaScript: ${error.message}`);
    }
  }

  const gitignore = read('.gitignore');
  for (const phrase of ['node_modules', 'coverage', '.nyc_output', '.env', '*.log']) {
    if (!gitignore.includes(phrase)) {
      failures.push(`.gitignore must include ${phrase}`);
    }
  }

  const examples = read('src/commands/cli-101-training/examples.js');
  for (const phrase of [
    'EXAMPLE_COMMANDS',
    'example: flags.string',
    '+15555550100',
    '+15555550101',
    '<YOUR_TWILIO_NUMBER>',
    'phone-numbers:search:local',
    'Review before running',
    'copy: flags.boolean',
    'flags.copy',
    'Re-run with --copy',
    'clipboardy.writeSync'
  ]) {
    if (!examples.includes(phrase)) {
      failures.push(`examples.js must include ${phrase}`);
    }
  }
  const forbiddenExamples = [
    '+1212' + '7363100',
    '+1415' + '5551212',
    '+1210' + '7574383',
    'phone-numbers:' + 'buy',
    'Twilio' + 'ClientCommand',
    'Twilio' + 'CliError'
  ];
  for (const forbidden of forbiddenExamples) {
    if (examples.includes(forbidden)) {
      failures.push(`examples.js must not include ${forbidden}`);
    }
  }

  for (const commandFile of [
    'src/commands/cli-101-training/feedback.js',
    'src/commands/cli-101-training/welcome.js'
  ]) {
    const command = read(commandFile);
    if (command.includes('Twilio' + 'ClientCommand') || command.includes('Twilio' + 'CliError')) {
      failures.push(`${commandFile} must not require Twilio credentials for training output`);
    }
  }

  const welcome = read('src/commands/cli-101-training/welcome.js');
  for (const phrase of [
    'function formatLearnerName',
    'LEARNER_NAME_MAX_LENGTH = 80',
    'replace(/[\\x00-\\x1F\\x7F]/g, \'\')',
    'module.exports.formatLearnerName'
  ]) {
    if (!welcome.includes(phrase)) {
      failures.push(`welcome.js must include ${phrase}`);
    }
  }

  const appveyor = read('appveyor.yml');
  if (!appveyor.includes('nodejs_version: "10"')) {
    failures.push('appveyor.yml must use the package-supported Node 10 baseline');
  }
  const forbiddenCi = ['Invoke-' + 'WebRequest', 'codecov' + '.io', 'bash ' + 'codecov.sh'];
  for (const forbidden of forbiddenCi) {
    if (appveyor.includes(forbidden)) {
      failures.push(`appveyor.yml must not download and execute remote CI scripts: ${forbidden}`);
    }
  }

  const docs = ['README.md', 'SECURITY.md', 'VISION.md', 'CHANGES.md']
    .map(read)
    .join('\n');
  for (const phrase of [
    'make check',
    'npm run check',
    'fake placeholder',
    'no phone-number purchases',
    'Twilio credentials',
    'Review before running',
    '--copy',
    'learner names'
  ]) {
    if (!docs.toLowerCase().includes(phrase.toLowerCase())) {
      failures.push(`docs must mention ${phrase}`);
    }
  }

  const plan = read(PLAN);
  if (!plan.includes('status: completed') || !plan.includes('npm run check')) {
    failures.push('plan must record completed status and npm run check verification');
  }

  const clipboardPlan = read(CLIPBOARD_PLAN);
  for (const phrase of ['status: completed', '--copy', 'clipboardy.writeSync', 'npm run check']) {
    if (!clipboardPlan.includes(phrase)) {
      failures.push(`clipboard plan must mention ${phrase}`);
    }
  }

  const checkPlan = read(CHECK_PLAN);
  for (const phrase of ['status: completed', 'make check', 'npm test']) {
    if (!checkPlan.includes(phrase)) {
      failures.push(`check wrapper plan must mention ${phrase}`);
    }
  }

  const welcomePlan = read(WELCOME_PLAN);
  for (const phrase of ['status: completed', 'formatLearnerName', 'npm run check']) {
    if (!welcomePlan.includes(phrase)) {
      failures.push(`welcome plan must mention ${phrase}`);
    }
  }

  const makefile = read('Makefile');
  if (!makefile.includes('check: verify')) {
    failures.push('Makefile must expose make check as the repository verification wrapper');
  }

  const svg = read('docs/readme-overview.svg');
  if (!svg.includes('<svg') || !svg.includes('</svg>')) {
    failures.push('docs/readme-overview.svg must remain an SVG');
  }

  if (failures.length) {
    for (const failure of failures) {
      console.error(failure);
    }
    process.exitCode = 1;
    return;
  }

  console.log('plugin-cli-101-training baseline checks passed.');
}

main();
