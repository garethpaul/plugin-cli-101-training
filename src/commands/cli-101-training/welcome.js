const { Command } = require('@oclif/core');
const chalk = require('chalk');
const inquirer = require('inquirer');

const LEARNER_NAME_MAX_GRAPHEMES = 80;
const LEARNER_NAME_MAX_CODE_POINTS = 160;
const LEARNER_NAME_MAX_UTF8_BYTES = 1024;
const LEARNER_NAME_SEGMENTER = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
const UNSAFE_TERMINAL_NAME_RE = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/gu;

function truncateByCodePointAndByte(value, maxCodePoints, maxBytes) {
  let result = '';
  let codePoints = 0;
  let bytes = 0;

  for (const codePoint of value) {
    const codePointBytes = Buffer.byteLength(codePoint, 'utf8');
    if (codePoints + 1 > maxCodePoints || bytes + codePointBytes > maxBytes) {
      break;
    }

    result += codePoint;
    codePoints += 1;
    bytes += codePointBytes;
  }

  return { result, codePoints, bytes };
}

function truncateLearnerName(value) {
  const bounded = truncateByCodePointAndByte(
    value,
    LEARNER_NAME_MAX_CODE_POINTS,
    LEARNER_NAME_MAX_UTF8_BYTES
  ).result;
  return Array.from(LEARNER_NAME_SEGMENTER.segment(bounded), ({ segment }) => segment)
    .slice(0, LEARNER_NAME_MAX_GRAPHEMES)
    .join('');
}

function sanitizeLearnerName(value) {
  return String(value).replace(UNSAFE_TERMINAL_NAME_RE, '');
}

function formatLearnerName(value) {
  const rawName = value === undefined || value === null ? '' : String(value);
  const name = truncateLearnerName(sanitizeLearnerName(rawName).trim());
  return name || 'there';
}

function formatLearnerNameForPrompt(value) {
  const rawName = value === undefined || value === null ? '' : String(value);
  return truncateLearnerName(sanitizeLearnerName(rawName));
}

class Welcome extends Command {
  async run() {
    const welcome = chalk.bold('>>>>>  ') +
      chalk.underline.bold('WELCOME TO TWILIO 101 TRAINING') +
      chalk.bold('  <<<<<');

    this.log();
    this.log('*************************************************************************');
    this.log('*                                                                       *');
    this.log(`*          ${welcome}          *`);
    this.log('*                                                                       *');
    this.log('*     twilio login                                                      *');
    this.log('*                                                                       *');
    this.log('*     OR                                                                *');
    this.log('*                                                                       *');
    this.log('*     twilio profiles:create                                            *');
    this.log('*                                                                       *');
    this.log('*************************************************************************');
    this.log();

    const responses = await inquirer.prompt([{
      filter: formatLearnerName,
      name: 'name',
      message: 'What is your name?',
      transformer: formatLearnerNameForPrompt,
      type: 'input'
    }]);

    this.log(`Hello ${chalk.bold(formatLearnerName(responses.name))}! Thanks for taking 101 training today.`);
  }
}

Welcome.description = 'Welcome to Twilio 101 Training';

module.exports = Welcome;
module.exports.formatLearnerName = formatLearnerName;
