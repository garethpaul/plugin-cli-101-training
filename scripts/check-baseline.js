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
const EXAMPLE_LOOKUP_PLAN = 'docs/plans/2026-06-10-plugin-cli-101-training-example-lookup.md';
const NODE_TOOLCHAIN_PLAN = 'docs/plans/2026-06-10-plugin-cli-node20-toolchain.md';
const CLIPBOARD_FAILURE_PLAN = 'docs/plans/2026-06-10-plugin-cli-101-training-clipboard-failures.md';
const HOSTED_VALIDATION_PLAN = 'docs/plans/2026-06-10-hosted-node-validation.md';
const OCLIF_TOOLCHAIN_PLAN = 'docs/plans/2026-06-12-oclif-development-toolchain.md';
const REQUIRED = [
  '.github/workflows/check.yml',
  '.gitignore',
  'CHANGES.md',
  '.nvmrc',
  'Makefile',
  'README.md',
  'SECURITY.md',
  'VISION.md',
  'bin/run',
  'bin/run.cmd',
  'docs/readme-overview.svg',
  'package-lock.json',
  'package.json',
  NODE_TOOLCHAIN_PLAN,
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
  EXAMPLE_LOOKUP_PLAN,
  CLIPBOARD_FAILURE_PLAN,
  HOSTED_VALIDATION_PLAN,
  OCLIF_TOOLCHAIN_PLAN,
  'scripts/check-baseline.js',
  'src/commands/cli-101-training/examples.js',
  'src/commands/cli-101-training/feedback.js',
  'src/commands/cli-101-training/welcome.js',
  'test_examples_catalog.js',
  'test_oclif_commands.js',
  'test_welcome_name_format.js'
];

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8').replace(/\r\n/g, '\n');
}

function markdownSection(text, heading) {
  const lines = text.split('\n');
  const start = lines.indexOf(`## ${heading}`);
  if (start === -1) return '';
  const followingHeading = lines.slice(start + 1).findIndex(line => line.startsWith('## '));
  const end = followingHeading === -1 ? lines.length : start + 1 + followingHeading;
  return lines.slice(start + 1, end).join('\n').trim();
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
  if (pkg.engines?.node !== '>=22.0.0' || read('.nvmrc').trim() !== '24') {
    failures.push('package metadata must require Node 22+ and .nvmrc must select Node 24');
  }
  if (pkg.dependencies['@oclif/core'] !== '^1.26.2' || pkg.dependencies['@twilio/cli-core'] !== '^8.3.4' || pkg.dependencies.inquirer !== '^8.2.7') {
    failures.push('package.json must keep the reviewed oclif, Twilio CLI Core, and Inquirer compatibility set');
  }
  if (JSON.stringify(pkg.devDependencies) !== JSON.stringify({ oclif: '^4.23.14' })) {
    failures.push('package.json must keep only the maintained oclif utility CLI as a direct development dependency');
  }
  for (const dependency of ['@oclif/command', '@oclif/config', '@oclif/dev-cli', '@oclif/test', '@twilio/cli-test', 'chai', 'eslint', 'eslint-config-oclif', 'globby', 'mocha', 'nyc']) {
    if (pkg.dependencies?.[dependency] || pkg.devDependencies?.[dependency]) {
      failures.push(`package.json must not restore unused legacy development dependency ${dependency}`);
    }
  }
  const lock = JSON.parse(read('package-lock.json'));
  if (lock.lockfileVersion !== 3 || lock.packages?.['']?.dependencies?.['@oclif/core'] !== '^1.26.2' || lock.packages?.['']?.dependencies?.['@twilio/cli-core'] !== '^8.3.4' || lock.packages?.['']?.dependencies?.inquirer !== '^8.2.7' || lock.packages?.['']?.devDependencies?.oclif !== '^4.23.14') {
    failures.push('package-lock.json must preserve the reviewed lockfileVersion 3 dependency graph');
  }
  if (pkg.scripts.check !== 'node scripts/check-baseline.js') {
    failures.push('package.json must expose npm run check');
  }
  if (pkg.scripts.test !== 'npm run check && node test_welcome_name_format.js && node test_examples_catalog.js && node test_oclif_commands.js') {
    failures.push('npm test must run the static baseline, focused behavior tests, and installed oclif command smoke tests');
  }
  if (pkg.scripts.lint !== 'npm run check') {
    failures.push('npm run lint must run the static baseline');
  }
  if (pkg.scripts.build !== 'npm run check') {
    failures.push('npm run build must run the static baseline');
  }
  if (pkg.scripts.postpack !== 'node -e "require(\'fs\').rmSync(\'oclif.manifest.json\', {force: true})"') {
    failures.push('package.json postpack cleanup must remain portable across hosted Linux and Windows');
  }
  if (pkg.scripts.prepack !== 'oclif manifest && oclif readme' || pkg.scripts.version !== 'oclif readme && git add README.md') {
    failures.push('package lifecycle scripts must use the maintained oclif utility CLI');
  }
  if (pkg.scripts.posttest) {
    failures.push('posttest must not hide the explicit hosted production-audit gate');
  }
  if (!Array.isArray(pkg.files) || !pkg.files.includes('/bin')) {
    failures.push('package.json files must include /bin so launchers are published');
  }

  if (process.platform !== 'win32') {
    if (!isExecutable('bin/run')) {
      failures.push('bin/run must remain executable for Unix launcher installs');
    }
    if (isExecutable('bin/run.cmd')) {
      failures.push('bin/run.cmd should not be marked executable');
    }
  }

  for (const jsFile of [
    'scripts/check-baseline.js',
    'src/commands/cli-101-training/examples.js',
    'src/commands/cli-101-training/feedback.js',
    'src/commands/cli-101-training/welcome.js',
    'test_examples_catalog.js',
    'test_oclif_commands.js',
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
  if (gitignore.includes('package-lock.json')) {
    failures.push('.gitignore must not exclude the reviewed npm lockfile');
  }

  const examples = read('src/commands/cli-101-training/examples.js');
  for (const phrase of [
    'EXAMPLE_COMMANDS',
    'Object.freeze({',
    'const EXAMPLE_CHOICES = Object.freeze(Object.keys(EXAMPLE_COMMANDS));',
    'function getExampleCommand',
    'Object.prototype.hasOwnProperty.call(EXAMPLE_COMMANDS, example)',
    'module.exports.getExampleCommand',
    'Unknown training example',
    "const { Command, Flags } = require('@oclif/core');",
    'example: Flags.string',
    '+15555550100',
    '+15555550101',
    '<YOUR_TWILIO_NUMBER>',
    'phone-numbers:search:local',
    'Review before running',
    'copy: Flags.boolean',
    'await this.parse(Examples)',
    'flags.copy',
    'Re-run with --copy',
    'clipboardy.writeSync',
    'Clipboard copy skipped: clipboard unavailable.'
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
    'src/commands/cli-101-training/examples.js',
    'src/commands/cli-101-training/feedback.js',
    'src/commands/cli-101-training/welcome.js'
  ]) {
    const command = read(commandFile);
    if (!command.includes("require('@oclif/core')") || command.includes("require('@oclif/command')") || command.includes("require('@oclif/config')")) {
      failures.push(`${commandFile} must use the compatible @oclif/core API without archived oclif imports`);
    }
    if (command.includes('Twilio' + 'ClientCommand') || command.includes('Twilio' + 'CliError')) {
      failures.push(`${commandFile} must not require Twilio credentials for training output`);
    }
  }

  const launcher = read('bin/run');
  for (const phrase of ["require('@oclif/core')", 'const { Errors, flush, run }', 'run()', '.then(flush)', '.catch(Errors.handle)']) {
    if (!launcher.includes(phrase)) {
      failures.push(`bin/run must include ${phrase}`);
    }
  }
  if (launcher.includes("require('@oclif/command')") || launcher.includes("require('@oclif/errors/handle')")) {
    failures.push('bin/run must not restore archived oclif launcher imports');
  }

  const commandTests = read('test_oclif_commands.js');
  for (const phrase of ['spawnSync', "['--help']", "'cli-101-training:feedback'", "'cli-101-training:examples'", "'--example'", "'debugger'"]) {
    if (!commandTests.includes(phrase)) {
      failures.push(`oclif command smoke tests must include ${phrase}`);
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

  if (fs.existsSync(path.join(ROOT, 'appveyor.yml'))) {
    failures.push('obsolete AppVeyor configuration must stay retired');
  }

  const workflow = read('.github/workflows/check.yml');
  for (const phrase of [
    'permissions:\n  contents: read',
    'cancel-in-progress: true',
    'runs-on: ${{ matrix.os }}',
    'os: [ubuntu-24.04, windows-2025]',
    'timeout-minutes: 10',
    'actions/checkout@df4cb1c069e1874edd31b4311f1884172cec0e10',
    'actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e',
    'node-version: [22, 24]',
    'persist-credentials: false',
    'cache: npm',
    'run: npm ci --ignore-scripts',
    'run: npm audit --audit-level=low',
    'run: npm test',
    'run: npm pack --dry-run'
  ]) {
    if (!workflow.includes(phrase)) {
      failures.push(`Check workflow must keep ${phrase}`);
    }
  }
  const expectedActions = [
    'actions/checkout@df4cb1c069e1874edd31b4311f1884172cec0e10',
    'actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e'
  ];
  const actions = [...workflow.matchAll(/^\s*(?:-\s*)?uses:\s*(\S+)\s*$/gm)].map(match => match[1]);
  if (JSON.stringify(actions) !== JSON.stringify(expectedActions)) {
    failures.push('Check workflow must use only the approved pinned checkout and setup-node actions');
  }
  if ((workflow.match(/^permissions:/gm) || []).length !== 1 || /^\s+[\w-]+:\s*write\s*$/m.test(workflow)) {
    failures.push('Check workflow must keep one read-only permissions block');
  }
  if ((workflow.match(/persist-credentials: false/g) || []).length !== 1) {
    failures.push('Check workflow must disable persisted checkout credentials exactly once');
  }
  if (/\bnpm install\b/.test(workflow) || (workflow.match(/npm ci --ignore-scripts/g) || []).length !== 1) {
    failures.push('Check workflow must install only from the lockfile with lifecycle scripts disabled');
  }
  const auditRuns = [...workflow.matchAll(/^\s*run:\s*(npm audit\S*.*)$/gm)].map(match => match[1].trim());
  if (JSON.stringify(auditRuns) !== JSON.stringify(['npm audit --audit-level=low']) || workflow.includes('npm audit --omit')) {
    failures.push('Check workflow must run exactly one full-graph npm audit at the low-severity threshold');
  }
  const forbiddenCi = ['Invoke-' + 'WebRequest', 'codecov' + '.io', 'bash ' + 'codecov.sh'];
  for (const forbidden of forbiddenCi) {
    if (workflow.includes(forbidden)) {
      failures.push(`Check workflow must not download and execute remote CI scripts: ${forbidden}`);
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
    'node test_examples_catalog.js',
    'node test_oclif_commands.js',
    'frozen example catalog',
    'frozen example choices',
    'unknown example keys',
    'clipboard failure details',
    'deprecated oclif',
    '@oclif/core',
    'full dependency graph',
    'Twilio CLI Core 8.3.4',
    'reviewed lockfile',
    'production dependencies',
    'executable launcher',
    'packaged launcher files',
    'hosted Linux'
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

  const exampleLookupPlan = read(EXAMPLE_LOOKUP_PLAN);
  for (const phrase of ['status: completed', 'getExampleCommand', 'unknown example keys', 'test_examples_catalog.js', 'npm test']) {
    if (!exampleLookupPlan.includes(phrase)) {
      failures.push(`example lookup plan must mention ${phrase}`);
    }
  }

  const clipboardFailurePlan = read(CLIPBOARD_FAILURE_PLAN);
  for (const phrase of ['status: completed', 'clipboard unavailable', 'test_examples_catalog.js', 'npm test']) {
    if (!clipboardFailurePlan.includes(phrase)) {
      failures.push(`clipboard failure plan must mention ${phrase}`);
    }
  }

  const nodeToolchainPlan = read(NODE_TOOLCHAIN_PLAN);
  for (const phrase of ['status: completed', 'Node 22', 'Node 24', 'AppVeyor', 'make check']) {
    if (!nodeToolchainPlan.includes(phrase)) {
      failures.push(`Node toolchain plan must mention ${phrase}`);
    }
  }

  const hostedValidationPlan = read(HOSTED_VALIDATION_PLAN);
  for (const phrase of ['status: completed', 'Node 22', 'Node 24', 'Linux', 'Windows', 'npm test']) {
    if (!hostedValidationPlan.includes(phrase)) {
      failures.push(`hosted validation plan must mention ${phrase}`);
    }
  }

  const oclifToolchainPlan = read(OCLIF_TOOLCHAIN_PLAN);
  const oclifToolchainStatus = [...oclifToolchainPlan.matchAll(/^status:\s*(.+?)\s*$/gmi)].map(match => match[1]);
  const oclifToolchainWork = markdownSection(oclifToolchainPlan, 'Work Completed');
  const oclifToolchainVerification = markdownSection(oclifToolchainPlan, 'Verification Completed');
  if (oclifToolchainStatus.length !== 1 || oclifToolchainStatus[0] !== 'completed' || !oclifToolchainWork) {
    failures.push('oclif toolchain plan must record one completed status and completed work');
  }
  if (!oclifToolchainVerification || /\b(?:pending|todo|tbd|not run)\b/i.test(oclifToolchainVerification)) {
    failures.push('oclif toolchain plan must record finished verification without pending markers');
  }
  for (const evidence of [
    'Node 22.22.2',
    'Node 24.16.0',
    '@oclif/core',
    'oclif utility CLI',
    'test_oclif_commands.js',
    'npm ci --ignore-scripts',
    'npm audit --audit-level=low',
    'npm test',
    'make lint',
    'make build',
    'make check',
    'npm pack --dry-run',
    'Eight hostile mutations',
    '27400192298',
    '27400193551',
    'd09e8682d01ed00b4838d237215f967a08cf129d',
    'ubuntu-24.04',
    'windows-2025',
    '495-package graph reported zero vulnerabilities',
    'expected eight files'
  ]) {
    if (!oclifToolchainVerification.includes(evidence)) {
      failures.push(`oclif toolchain plan must preserve verification evidence: ${evidence}`);
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
  for (const phrase of [
    'ROOT := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))',
    'cd "$(ROOT)" && $(NPM) run lint',
    'cd "$(ROOT)" && $(NPM) test',
    'cd "$(ROOT)" && $(NPM) run build'
  ]) {
    if (!makefile.includes(phrase)) {
      failures.push(`Makefile must remain caller-directory independent with ${phrase}`);
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
