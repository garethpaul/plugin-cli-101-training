#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = __dirname;
const MAKEFILE = path.join(ROOT, 'Makefile');
const REPOSITORY_GATE = path.join(ROOT, 'scripts', 'repository-gate.js');
const BASELINE_SUCCESS = 'plugin-cli-101-training baseline checks passed.';
const MAX_BUFFER = 10 * 1024 * 1024;

function normalize(value) {
  return String(value || '').replace(/\r\n/g, '\n');
}

function writeFile(file, contents) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, contents);
}

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: options.cwd || ROOT,
    env: options.env || process.env,
    encoding: 'utf8',
    maxBuffer: MAX_BUFFER,
    shell: false
  });
}

function makeTempFixture() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'plugin-cli-gate-'));
  const externalCwd = path.join(directory, 'external');
  const maliciousRoot = path.join(directory, 'malicious-root');
  const marker = path.join(directory, 'attacker-ran.txt');
  const markerScript = path.join(directory, 'write-marker.js');
  const fakeShell = path.join(directory, 'fake-shell');
  const fakeShellMarker = path.join(directory, 'fake-shell-ran.txt');

  fs.mkdirSync(externalCwd);
  fs.mkdirSync(maliciousRoot);
  writeFile(markerScript, [
    "'use strict';",
    "const fs = require('fs');",
    "fs.appendFileSync(process.env.ATTACKER_MARKER, `${process.cwd()}\\n`);",
    "console.log('attacker controlled validation ran');",
    ''
  ].join('\n'));
  writeFile(path.join(maliciousRoot, 'package.json'), JSON.stringify({
    scripts: {
      build: `${JSON.stringify(process.execPath)} ${JSON.stringify(markerScript)}`,
      check: `${JSON.stringify(process.execPath)} ${JSON.stringify(markerScript)}`,
      lint: `${JSON.stringify(process.execPath)} ${JSON.stringify(markerScript)}`,
      test: `${JSON.stringify(process.execPath)} ${JSON.stringify(markerScript)}`
    }
  }, null, 2));
  writeFile(fakeShell, [
    '#!/bin/sh',
    `printf '%s\\n' "$*" >> ${JSON.stringify(fakeShellMarker)}`,
    "printf 'PLUGIN_CLI_101_REPOSITORY_GATE_OK'",
    ''
  ].join('\n'));
  fs.chmodSync(fakeShell, 0o755);

  return { directory, externalCwd, fakeShell, fakeShellMarker, maliciousRoot, marker, markerScript };
}

function markerWasWritten(marker) {
  return fs.existsSync(marker) && fs.readFileSync(marker, 'utf8').length > 0;
}

function makeEnv(fixture, extra = {}) {
  return {
    ...process.env,
    ...extra,
    ATTACKER_MARKER: fixture.marker,
    FORCE_COLOR: '0'
  };
}

function assertRepositoryBaseline(result, marker, label) {
  assert.strictEqual(result.error, undefined, `${label}: ${result.error && result.error.message}`);
  assert.strictEqual(
    result.status,
    0,
    `${label} failed\nSTDOUT:\n${normalize(result.stdout)}\nSTDERR:\n${normalize(result.stderr)}`
  );
  assert.ok(
    `${normalize(result.stdout)}\n${normalize(result.stderr)}`.includes(BASELINE_SUCCESS),
    `${label} did not run the repository baseline\nSTDOUT:\n${normalize(result.stdout)}\nSTDERR:\n${normalize(result.stderr)}`
  );
  assert.ok(!markerWasWritten(marker), `${label} executed attacker-controlled validation`);
}

function assertMakeRejected(result, fixture, label) {
  assert.strictEqual(result.error, undefined, `${label}: ${result.error && result.error.message}`);
  assert.notStrictEqual(result.status, 0, `${label} must fail closed`);
  assert.match(`${normalize(result.stdout)}\n${normalize(result.stderr)}`, /Make is not a trusted validation entrypoint/);
  assert.ok(!markerWasWritten(fixture.fakeShellMarker), `${label} executed the fake shell`);
  assert.ok(!markerWasWritten(fixture.marker), `${label} executed attacker-controlled validation`);
}

function assertRejectsFakeShell(result, fixture, label) {
  assertMakeRejected(result, fixture, label);
}

function runMakeLint(fixture, args, extraEnv = {}) {
  return run('make', args, {
    cwd: fixture.externalCwd,
    env: makeEnv(fixture, extraEnv)
  });
}

function test(name, callback) {
  try {
    callback();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    console.error(error.stack || error.message);
    process.exitCode = 1;
  }
}

test('package scripts invoke the repository-owned gate directly', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const expected = {
    build: 'node scripts/repository-gate.js build',
    check: 'node scripts/repository-gate.js check',
    lint: 'node scripts/repository-gate.js lint',
    test: 'node scripts/repository-gate.js test'
  };

  for (const [scriptName, command] of Object.entries(expected)) {
    assert.strictEqual(pkg.scripts[scriptName], command, `${scriptName} must use the direct gate`);
    assert.ok(!pkg.scripts[scriptName].includes('make '), `${scriptName} must not delegate to Make`);
    assert.ok(!pkg.scripts[scriptName].includes('./'), `${scriptName} must be Windows-compatible`);
  }
});

test('direct repository gate runs from an external cwd and ignores ROOT and NPM', () => {
  const fixture = makeTempFixture();
  const result = run(process.execPath, [REPOSITORY_GATE, 'lint'], {
    cwd: fixture.externalCwd,
    env: makeEnv(fixture, { ROOT: fixture.maliciousRoot, NPM: 'true' })
  });
  assertRepositoryBaseline(result, fixture.marker, 'direct repository gate');
});

test('make rejects a later override NPM true', () => {
  const fixture = makeTempFixture();
  const laterMakefile = path.join(fixture.directory, 'later-npm.mk');
  writeFile(laterMakefile, 'override NPM := true\n');
  const result = runMakeLint(fixture, ['-f', MAKEFILE, '-f', laterMakefile, 'lint']);
  assertMakeRejected(result, fixture, 'later NPM override attack');
});

test('make rejects a later override ROOT to an attacker package', () => {
  const fixture = makeTempFixture();
  const laterMakefile = path.join(fixture.directory, 'later-root.mk');
  writeFile(laterMakefile, `override ROOT := ${fixture.maliciousRoot}\n`);
  const result = runMakeLint(fixture, ['-f', MAKEFILE, '-f', laterMakefile, 'lint']);
  assertMakeRejected(result, fixture, 'later ROOT override attack');
});

test('make lint rejects later replacements for command-bearing variables', () => {
  const fixture = makeTempFixture();
  const laterMakefile = path.join(fixture.directory, 'later-run-commands.mk');
  writeFile(laterMakefile, [
    `RUN_LINT := ${JSON.stringify(process.execPath)} ${JSON.stringify(fixture.markerScript)}`,
    `RUN_TEST := ${JSON.stringify(process.execPath)} ${JSON.stringify(fixture.markerScript)}`,
    `RUN_BUILD := ${JSON.stringify(process.execPath)} ${JSON.stringify(fixture.markerScript)}`,
    ''
  ].join('\n'));
  const result = runMakeLint(fixture, ['-f', MAKEFILE, '-f', laterMakefile, 'lint']);
  assertMakeRejected(result, fixture, 'later command variable replacement attack');
});

test('make lint fails closed on a later -f recipe replacement', () => {
  const fixture = makeTempFixture();
  const replacementMakefile = path.join(fixture.directory, 'replace-recipe.mk');
  writeFile(replacementMakefile, [
    'lint:',
    `\t@${JSON.stringify(process.execPath)} ${JSON.stringify(fixture.markerScript)}`,
    ''
  ].join('\n'));
  const result = runMakeLint(fixture, ['-f', MAKEFILE, '-f', replacementMakefile, 'lint']);
  assertMakeRejected(result, fixture, 'later recipe replacement attack');
});

test('make rejects command-line SHELL without executing it', () => {
  const fixture = makeTempFixture();
  const result = runMakeLint(fixture, ['-f', MAKEFILE, `SHELL=${fixture.fakeShell}`, 'lint']);
  assertRejectsFakeShell(result, fixture, 'command-line SHELL attack');
});

test('make rejects MAKEFLAGS SHELL without executing it', () => {
  const fixture = makeTempFixture();
  const result = runMakeLint(fixture, ['-f', MAKEFILE, 'lint'], {
    MAKEFLAGS: `SHELL=${fixture.fakeShell}`
  });
  assertRejectsFakeShell(result, fixture, 'MAKEFLAGS SHELL attack');
});

test('make rejects a MAKEFILES prelude SHELL without executing it', () => {
  const fixture = makeTempFixture();
  const prelude = path.join(fixture.directory, 'prelude.mk');
  writeFile(prelude, `SHELL := ${fixture.fakeShell}\n`);
  const result = runMakeLint(fixture, ['-f', MAKEFILE, 'lint'], { MAKEFILES: prelude });
  assertRejectsFakeShell(result, fixture, 'MAKEFILES prelude SHELL attack');
});

test('make rejects an earlier -f SHELL without executing it', () => {
  const fixture = makeTempFixture();
  const earlierMakefile = path.join(fixture.directory, 'earlier-shell.mk');
  writeFile(earlierMakefile, `SHELL := ${fixture.fakeShell}\n`);
  const result = runMakeLint(fixture, ['-f', earlierMakefile, '-f', MAKEFILE, 'lint']);
  assertRejectsFakeShell(result, fixture, 'earlier -f SHELL attack');
});

if (!process.exitCode) {
  console.log('repository gate tests passed.');
}
