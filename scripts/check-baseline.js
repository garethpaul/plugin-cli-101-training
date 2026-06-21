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
const UNICODE_CONTROL_PLAN = 'docs/plans/2026-06-13-unicode-control-name-sanitization.md';
const INTERACTIVE_PROMPT_PLAN = 'docs/plans/2026-06-13-interactive-prompt-tests.md';
const CODE_POINT_LIMIT_PLAN = 'docs/plans/2026-06-13-code-point-name-limit.md';
const UNICODE_SEPARATOR_PLAN = 'docs/plans/2026-06-15-unicode-line-separator-name-sanitization.md';
const TRANSITIVE_ADVISORY_PLAN = 'docs/plans/2026-06-15-transitive-advisory-remediation.md';
const NODE_REQUIRE_ESM_PLAN = 'docs/plans/2026-06-17-node-require-esm-floor.md';
const GRAPHEME_LIMIT_PLAN = 'docs/plans/2026-06-17-grapheme-safe-name-limit.md';
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
  UNICODE_CONTROL_PLAN,
  INTERACTIVE_PROMPT_PLAN,
  CODE_POINT_LIMIT_PLAN,
  UNICODE_SEPARATOR_PLAN,
  TRANSITIVE_ADVISORY_PLAN,
  NODE_REQUIRE_ESM_PLAN,
  GRAPHEME_LIMIT_PLAN,
  'scripts/check-audit.js',
  'scripts/check-baseline.js',
  'scripts/repository-gate.js',
  'src/commands/cli-101-training/examples.js',
  'src/commands/cli-101-training/feedback.js',
  'src/commands/cli-101-training/welcome.js',
  'src/js-yaml-compat.js',
  'test_examples_catalog.js',
  'test_audit_policy.js',
  'test_oclif_commands.js',
  'test_repository_gate.js',
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
  if (pkg.engines?.node !== '>=22.13.0' || read('.nvmrc').trim() !== '24') {
    failures.push('package metadata must require Node 22.13+ and .nvmrc must select Node 24');
  }
  if (pkg.dependencies['@oclif/core'] !== '^1.26.2' || pkg.dependencies['@twilio/cli-core'] !== '^8.3.4' || pkg.dependencies.inquirer !== '^8.2.7') {
    failures.push('package.json must keep the reviewed oclif, Twilio CLI Core, and Inquirer compatibility set');
  }
  if (JSON.stringify(pkg.devDependencies) !== JSON.stringify({ oclif: '^4.23.14' })) {
    failures.push('package.json must keep only the maintained oclif utility CLI as a direct development dependency');
  }
  if (JSON.stringify(pkg.overrides) !== JSON.stringify({ 'form-data': '4.0.6', 'js-yaml': '4.2.0' })) {
    failures.push('package.json must pin the reviewed form-data and js-yaml advisory overrides');
  }
  for (const dependency of ['@oclif/command', '@oclif/config', '@oclif/dev-cli', '@oclif/test', '@twilio/cli-test', 'chai', 'eslint', 'eslint-config-oclif', 'globby', 'mocha', 'nyc']) {
    if (pkg.dependencies?.[dependency] || pkg.devDependencies?.[dependency]) {
      failures.push(`package.json must not restore unused legacy development dependency ${dependency}`);
    }
  }
  const lock = JSON.parse(read('package-lock.json'));
  if (lock.lockfileVersion !== 3 || lock.packages?.['']?.engines?.node !== '>=22.13.0' || lock.packages?.['']?.dependencies?.['@oclif/core'] !== '^1.26.2' || lock.packages?.['']?.dependencies?.['@twilio/cli-core'] !== '^8.3.4' || lock.packages?.['']?.dependencies?.inquirer !== '^8.2.7' || lock.packages?.['']?.devDependencies?.oclif !== '^4.23.14') {
    failures.push('package-lock.json must preserve the reviewed lockfileVersion 3 dependency graph');
  }
  if (
    lock.packages?.['node_modules/form-data']?.version !== '4.0.6' ||
    lock.packages?.['node_modules/js-yaml']?.version !== '4.2.0' ||
    lock.packages?.['node_modules/@oclif/core/node_modules/js-yaml'] ||
    lock.packages?.['node_modules/@twilio/cli-core/node_modules/js-yaml']
  ) {
    failures.push('package-lock.json must resolve form-data 4.0.6 and one patched js-yaml 4.2.0 copy');
  }
  const expectedGateScripts = {
    check: 'node scripts/repository-gate.js check',
    lint: 'node scripts/repository-gate.js lint',
    build: 'node scripts/repository-gate.js build',
    test: 'node scripts/repository-gate.js test'
  };
  for (const [scriptName, expectedCommand] of Object.entries(expectedGateScripts)) {
    if (pkg.scripts[scriptName] !== expectedCommand) {
      failures.push('package.json scripts must invoke the repository-owned gate directly');
    }
    if (/\bmake\b|\.\//.test(pkg.scripts[scriptName] || '')) {
      failures.push('package.json scripts must remain Windows-compatible and must not delegate authority to Make');
    }
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
    'scripts/check-audit.js',
    'scripts/check-baseline.js',
    'scripts/repository-gate.js',
    'src/commands/cli-101-training/examples.js',
    'src/commands/cli-101-training/feedback.js',
    'src/commands/cli-101-training/welcome.js',
    'src/js-yaml-compat.js',
    'test_audit_policy.js',
    'test_examples_catalog.js',
    'test_oclif_commands.js',
    'test_repository_gate.js',
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
  for (const phrase of ["require('../src/js-yaml-compat')", "require('@oclif/core')", 'const { Errors, flush, run }', 'run()', '.then(flush)', '.catch(Errors.handle)']) {
    if (!launcher.includes(phrase)) {
      failures.push(`bin/run must include ${phrase}`);
    }
  }
  const yamlCompat = read('src/js-yaml-compat.js');
  for (const phrase of ["require('js-yaml')", 'yaml.safeLoad = yaml.load', 'yaml.safeDump = yaml.dump']) {
    if (!yamlCompat.includes(phrase)) {
      failures.push(`js-yaml compatibility preload must include ${phrase}`);
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
    'LEARNER_NAME_MAX_GRAPHEMES = 80',
    'LEARNER_NAME_MAX_CODE_POINTS = 160',
    'LEARNER_NAME_MAX_UTF8_BYTES = 1024',
    "LEARNER_NAME_SEGMENTER = new Intl.Segmenter(undefined, { granularity: 'grapheme' })",
    'UNSAFE_TERMINAL_NAME_RE = /[\\p{Cc}\\p{Cf}\\p{Zl}\\p{Zp}]/gu',
    'function truncateByCodePointAndByte',
    "Buffer.byteLength(codePoint, 'utf8')",
    'function formatLearnerNameForPrompt',
    "replace(UNSAFE_TERMINAL_NAME_RE, '')",
    'LEARNER_NAME_SEGMENTER.segment(bounded)',
    '.slice(0, LEARNER_NAME_MAX_GRAPHEMES)',
    'filter: formatLearnerName',
    'transformer: formatLearnerNameForPrompt',
    ".join('')",
    'module.exports.formatLearnerName'
  ]) {
    if (!welcome.includes(phrase)) {
      failures.push(`welcome.js must include ${phrase}`);
    }
  }

  const welcomeTests = read('test_welcome_name_format.js');
  for (const phrase of ["'A\\u009BB'", "'zero\\u200Dwidth'", "'zerowidth'", "'line\\u2028separator'", "'paragraph\\u2029separator'", "name: 'Line\\u2028and\\u2029paragraph'", "output.includes('Hello Alice! Thanks for taking 101 training today.')", "separatorOutput.includes('Hello Lineandparagraph! Thanks for taking 101 training today.')", 'codePointBoundaryName', "'x'.repeat(79)", "'😀'.repeat(100)", "Array.from(formatLearnerName('😀'.repeat(100))).length", "assert.strictEqual(formatLearnerName(flagBoundaryName), `${'x'.repeat(79)}🇺🇸`);", "assert.strictEqual(formatLearnerName(combiningBoundaryName), `${'x'.repeat(79)}e\\u0301`);", 'function loadWelcomeCommand(overrides = {})', "prompt: async () => ({ name: ' A\\u0000lice ' })", 'oversizedSingleGrapheme', "Buffer.byteLength(boundedSingleGrapheme, 'utf8') <= 1024", 'Array.from(boundedSingleGrapheme).length <= 160', 'unsafePromptInput', 'question.transformer', 'question.filter', '!unsafePromptOutput.join(\'\\n\').includes(unsafePromptInput)', '!/[\\p{Cc}\\p{Cf}\\p{Zl}\\p{Zp}]/u.test(line)']) {
    if (!welcomeTests.includes(phrase)) {
      failures.push(`welcome name tests must include ${phrase}`);
    }
  }

  const exampleTests = read('test_examples_catalog.js');
  for (const phrase of ['overrides.inquirer', "prompt: async () => ({ example: 'webhook' })", 'interactiveCommand.parse = async () => ({ flags: {} })', "interactiveOutput.some(line => line.includes('<YOUR_TWILIO_NUMBER>'))", 'assert.strictEqual(clipboardWrites, 0)']) {
    if (!exampleTests.includes(phrase)) {
      failures.push(`example catalog tests must include ${phrase}`);
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
    'name: test (${{ matrix.os }}, ${{ matrix.node.label }})',
    'os: [ubuntu-24.04, windows-2025]',
    'timeout-minutes: 10',
    'actions/checkout@df4cb1c069e1874edd31b4311f1884172cec0e10',
    'actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e',
    "version: '22.13.0'",
    "label: '22'",
    "version: '24'",
    "label: '24'",
    'node-version: ${{ matrix.node.version }}',
    'persist-credentials: false',
    'cache: npm',
    'run: npm ci --ignore-scripts',
    'run: node scripts/check-audit.js',
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
  if ((workflow.match(/node scripts\/check-audit\.js/g) || []).length !== 1 || /npm audit|--omit/.test(workflow)) {
    failures.push('Check workflow must run exactly one reviewed full-graph dependency audit policy');
  }
  const auditPolicy = read('scripts/check-audit.js');
  for (const phrase of [
    "['audit', '--audit-level=low', '--json']",
    "shell: platform === 'win32'",
    'moderate: 0, high: 0, critical: 0, total: 0',
    'expected no vulnerable packages',
    'Dependency audit reported zero known vulnerabilities.'
  ]) {
    if (!auditPolicy.includes(phrase)) failures.push(`dependency audit policy must keep ${phrase}`);
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
    'Unicode control and format characters',
    'Unicode line and paragraph separators',
    'Unicode code points',
    'grapheme clusters',
    'lone surrogate',
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
    'form-data 4.0.6',
    'js-yaml 4.2.0',
    'production dependencies',
    'executable launcher',
    'packaged launcher files',
    'hosted Linux',
    'interactive welcome and example prompt paths'
  ]) {
    if (!docs.toLowerCase().includes(phrase.toLowerCase())) {
      failures.push(`docs must mention ${phrase}`);
    }
  }
  const graphemeClaims = {
    'README.md': '80 grapheme clusters without splitting',
    'SECURITY.md': 'display limit by grapheme clusters',
    'VISION.md': 'truncation grapheme-safe at the 80-character boundary',
    'CHANGES.md': 'truncate by grapheme clusters'
  };
  for (const [file, phrase] of Object.entries(graphemeClaims)) {
    if (!read(file).includes(phrase)) {
      failures.push(`${file} must include ${phrase}`);
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

  const unicodeControlPlan = read(UNICODE_CONTROL_PLAN);
  for (const phrase of ['status: completed', 'npm test', 'six hostile mutations', 'Unicode control', 'Unicode format']) {
    if (!unicodeControlPlan.includes(phrase)) {
      failures.push(`Unicode control plan must mention ${phrase}`);
    }
  }

  const interactivePromptPlan = read(INTERACTIVE_PROMPT_PLAN);
  for (const phrase of ['status: completed', 'Node 22', 'Node 24', 'npm test', 'hostile mutations rejected', 'production command sources had no diff', 'git diff --check', 'secret, real-phone-number, generated-artifact, and dependency-drift scan']) {
    if (!interactivePromptPlan.includes(phrase)) {
      failures.push(`interactive prompt plan must mention ${phrase}`);
    }
  }

  const codePointLimitPlan = read(CODE_POINT_LIMIT_PLAN);
  for (const phrase of ['status: completed', 'Node 22', 'Node 24', 'npm test', 'npm audit', 'npm pack --dry-run', 'hostile mutations', 'git diff --check', 'secret and generated-artifact scan']) {
    if (!codePointLimitPlan.includes(phrase)) {
      failures.push(`code-point name limit plan must mention ${phrase}`);
    }
  }

  const unicodeSeparatorPlan = read(UNICODE_SEPARATOR_PLAN);
  const unicodeSeparatorStatus = [...unicodeSeparatorPlan.matchAll(/^status:\s*(.+?)\s*$/gmi)].map(match => match[1]);
  const unicodeSeparatorWork = markdownSection(unicodeSeparatorPlan, 'Work Completed');
  const unicodeSeparatorVerification = markdownSection(unicodeSeparatorPlan, 'Verification Completed');
  if (unicodeSeparatorStatus.length !== 1 || unicodeSeparatorStatus[0] !== 'completed' || !unicodeSeparatorWork) {
    failures.push('Unicode separator plan must record one completed status and completed work');
  }

  const transitiveAdvisoryPlan = read(TRANSITIVE_ADVISORY_PLAN);
  const transitiveAdvisoryStatus = [...transitiveAdvisoryPlan.matchAll(/^status:\s*(.+?)\s*$/gmi)].map(match => match[1]);
  const transitiveAdvisoryWork = markdownSection(transitiveAdvisoryPlan, 'Work Completed');
  const transitiveAdvisoryVerification = markdownSection(transitiveAdvisoryPlan, 'Verification Completed');
  if (transitiveAdvisoryStatus.length !== 1 || transitiveAdvisoryStatus[0] !== 'completed' || !transitiveAdvisoryWork) {
    failures.push('transitive advisory plan must record one completed status and completed work');
  }

  const nodeRequireEsmPlan = read(NODE_REQUIRE_ESM_PLAN);
  for (const phrase of ['status: completed', 'Node 22.11.0', 'Node 22.13.0', 'ERR_REQUIRE_ESM', 'npm test', 'npm pack --dry-run', '27664317402', '27664325793']) {
    if (!nodeRequireEsmPlan.includes(phrase)) {
      failures.push(`Node require(esm) floor plan must mention ${phrase}`);
    }
  }
  const graphemeLimitPlan = read(GRAPHEME_LIMIT_PLAN);
  const graphemeLimitStatus = [...graphemeLimitPlan.matchAll(/^status:\s*(.+?)\s*$/gmi)].map(match => match[1]);
  const graphemeLimitWork = markdownSection(graphemeLimitPlan, 'Work Completed');
  const graphemeLimitVerification = markdownSection(graphemeLimitPlan, 'Verification Completed');
  if (graphemeLimitStatus.length !== 1 || graphemeLimitStatus[0] !== 'completed' || !graphemeLimitWork) {
    failures.push('grapheme-safe name limit plan must record one completed status and completed work');
  }
  if (!graphemeLimitVerification || /\b(?:pending|todo|tbd|not run)\b/i.test(graphemeLimitVerification)) {
    failures.push('grapheme-safe name limit plan must record finished verification');
  }
  for (const evidence of ['node test_welcome_name_format.js', 'npm test', 'make check', 'external working directory', 'npm audit', 'npm pack --dry-run', 'Six isolated hostile mutations were rejected', 'git diff --check']) {
    if (!graphemeLimitVerification.includes(evidence)) {
      failures.push(`grapheme-safe name limit verification must mention ${evidence}`);
    }
  }
  if (!transitiveAdvisoryVerification || /\b(?:pending|todo|tbd|not run)\b/i.test(transitiveAdvisoryVerification)) {
    failures.push('transitive advisory plan must record finished verification without pending markers');
  }
  for (const evidence of [
    'form-data 4.0.6',
    'js-yaml 4.2.0',
    'npm ci --ignore-scripts',
    'npm audit --audit-level=low',
    'node scripts/check-audit.js',
    'zero known vulnerabilities',
    'npm test',
    'make check',
    'external working directory',
    'npm pack --dry-run',
    'hostile mutations',
    'git diff --check',
    'secret and generated-artifact audits'
  ]) {
    if (!transitiveAdvisoryVerification.includes(evidence)) {
      failures.push(`transitive advisory verification must mention ${evidence}`);
    }
  }
  if (!unicodeSeparatorVerification || /\b(?:pending|todo|tbd|not run)\b/i.test(unicodeSeparatorVerification)) {
    failures.push('Unicode separator plan must record finished verification without pending markers');
  }
  for (const evidence of [
    'node test_welcome_name_format.js',
    'npm test',
    'npm run lint',
    'npm run build',
    'make check',
    'external working directory',
    'npm audit',
    'npm pack --dry-run',
    'hostile mutations',
    'git diff --check',
    'secret and generated-artifact audits'
  ]) {
    if (!unicodeSeparatorVerification.includes(evidence)) {
      failures.push(`Unicode separator verification must mention ${evidence}`);
    }
  }

  const makefile = read('Makefile');
  const expectedMakefile = '.PHONY: build check lint test verify\n\n' +
    '$(error Make is not a trusted validation entrypoint; run npm run check, npm run lint, npm test, or npm run build)\n';
  if (makefile !== expectedMakefile) {
    failures.push('Makefile must remain an exact fail-closed sentinel with no shell execution or recipes');
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
