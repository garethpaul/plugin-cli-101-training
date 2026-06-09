#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PLAN = 'docs/plans/2026-06-08-plugin-cli-101-training-baseline.md';
const CLIPBOARD_PLAN = 'docs/plans/2026-06-08-plugin-cli-101-training-clipboard-opt-in.md';
const CHECK_PLAN = 'docs/plans/2026-06-08-plugin-cli-101-training-check-wrapper.md';
const WELCOME_PLAN = 'docs/plans/2026-06-09-plugin-cli-101-training-welcome-name-normalization.md';
const FROZEN_EXAMPLES_PLAN = 'docs/plans/2026-06-09-plugin-cli-101-training-frozen-examples.md';
const BIN_MODE_PLAN = 'docs/plans/2026-06-09-plugin-cli-101-training-bin-run-mode.md';
const PACKAGE_FILES_PLAN = 'docs/plans/2026-06-09-plugin-cli-101-training-package-files.md';
const FROZEN_CHOICES_PLAN = 'docs/plans/2026-06-09-plugin-cli-101-training-frozen-example-choices.md';
const GATE_ALIASES_PLAN = 'docs/plans/2026-06-09-plugin-cli-101-training-gate-aliases.md';
const BIDI_NAME_PLAN = 'docs/plans/2026-06-09-plugin-cli-101-training-bidi-name-sanitization.md';
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
  FROZEN_EXAMPLES_PLAN,
  BIN_MODE_PLAN,
  PACKAGE_FILES_PLAN,
  FROZEN_CHOICES_PLAN,
  GATE_ALIASES_PLAN,
  BIDI_NAME_PLAN,
  'scripts/check-baseline.js',
  'src/commands/cli-101-training/examples.js',
  'src/commands/cli-101-training/feedback.js',
  'src/commands/cli-101-training/welcome.js',
  'test_welcome_name_format.js'
];

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function parseSource(relativePath) {
  return read(relativePath).replace(/^#![^\n]*\n/, '');
}

function isExecutable(relativePath) {
  return Boolean(fs.statSync(path.join(ROOT, relativePath)).mode & 0o111);
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
  if (pkg.scripts.test !== 'npm run check && node test_welcome_name_format.js') {
    failures.push('npm test must run the static baseline and welcome-name tests');
  }
  if (pkg.scripts.lint !== 'npm run check') {
    failures.push('npm run lint must run the static baseline');
  }
  if (pkg.scripts.build !== 'npm run check') {
    failures.push('npm run build must run the static baseline');
  }
  if (pkg.scripts.posttest) {
    failures.push('posttest should not run npm audit without a committed lockfile');
  }
  if (!Array.isArray(pkg.files) || !pkg.files.includes('/bin')) {
    failures.push('package.json files must include /bin so launchers are published');
  }

  if (!isExecutable('bin/run')) {
    failures.push('bin/run must remain executable for Unix launcher installs');
  }
  if (isExecutable('bin/run.cmd')) {
    failures.push('bin/run.cmd should not be marked executable');
  }

  for (const jsFile of [
    'scripts/check-baseline.js',
    'src/commands/cli-101-training/examples.js',
    'src/commands/cli-101-training/feedback.js',
    'src/commands/cli-101-training/welcome.js',
    'test_welcome_name_format.js'
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
    'Object.freeze({',
    'const EXAMPLE_CHOICES = Object.freeze(Object.keys(EXAMPLE_COMMANDS));',
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
    'BIDI_CONTROL_RE = /[\\u202A-\\u202E\\u2066-\\u2069]/g',
    'replace(/[\\x00-\\x1F\\x7F]/g, \'\')',
    "replace(BIDI_CONTROL_RE, '')",
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
    'make lint',
    'make build',
    'npm run check',
    'npm run lint',
    'npm run build',
    'fake placeholder',
    'no phone-number purchases',
    'Twilio credentials',
    'Review before running',
    '--copy',
    'learner names',
    'bidirectional formatting controls',
    'node test_welcome_name_format.js',
    'frozen example catalog',
    'frozen example choices',
    'executable launcher',
    'packaged launcher files'
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

  const frozenExamplesPlan = read(FROZEN_EXAMPLES_PLAN);
  for (const phrase of ['status: completed', 'Object.freeze', 'npm run check']) {
    if (!frozenExamplesPlan.includes(phrase)) {
      failures.push(`frozen examples plan must mention ${phrase}`);
    }
  }

  const binModePlan = read(BIN_MODE_PLAN);
  for (const phrase of ['status: completed', 'bin/run', 'executable', 'npm run check']) {
    if (!binModePlan.includes(phrase)) {
      failures.push(`bin mode plan must mention ${phrase}`);
    }
  }

  const packageFilesPlan = read(PACKAGE_FILES_PLAN);
  for (const phrase of ['status: completed', '/bin', 'package.json', 'npm run check']) {
    if (!packageFilesPlan.includes(phrase)) {
      failures.push(`package files plan must mention ${phrase}`);
    }
  }

  const frozenChoicesPlan = read(FROZEN_CHOICES_PLAN);
  for (const phrase of ['status: completed', 'EXAMPLE_CHOICES', 'Object.freeze', 'npm run check']) {
    if (!frozenChoicesPlan.includes(phrase)) {
      failures.push(`frozen choices plan must mention ${phrase}`);
    }
  }

  const gateAliasesPlan = read(GATE_ALIASES_PLAN);
  for (const phrase of ['status: completed', 'make lint', 'make build', 'npm run lint', 'npm run build']) {
    if (!gateAliasesPlan.includes(phrase)) {
      failures.push(`gate aliases plan must mention ${phrase}`);
    }
  }

  const bidiNamePlan = read(BIDI_NAME_PLAN);
  for (const phrase of ['status: completed', 'formatLearnerName', 'bidi-control', 'test_welcome_name_format.js', 'npm test']) {
    if (!bidiNamePlan.includes(phrase)) {
      failures.push(`bidi name plan must mention ${phrase}`);
    }
  }

  const makefile = read('Makefile');
  if (!makefile.includes('check: verify')) {
    failures.push('Makefile must expose make check as the repository verification wrapper');
  }
  for (const phrase of ['lint:', 'build:', 'verify: lint test build']) {
    if (!makefile.includes(phrase)) {
      failures.push(`Makefile must include ${phrase}`);
    }
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
