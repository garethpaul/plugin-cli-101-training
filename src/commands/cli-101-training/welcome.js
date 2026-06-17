const { Command } = require('@oclif/core');
const chalk = require('chalk');
const inquirer = require('inquirer');

const LEARNER_NAME_MAX_LENGTH = 80;
const LEARNER_NAME_SEGMENTER = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
const UNSAFE_TERMINAL_NAME_RE = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/gu;

function formatLearnerName(value) {
  const rawName = value === undefined || value === null ? '' : String(value);
  const name = rawName
    .replace(UNSAFE_TERMINAL_NAME_RE, '')
    .trim();
  return Array.from(LEARNER_NAME_SEGMENTER.segment(name || 'there'), ({ segment }) => segment)
    .slice(0, LEARNER_NAME_MAX_LENGTH)
    .join('');
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
      name: 'name',
      message: 'What is your name?',
      type: 'input'
    }]);

    this.log(`Hello ${chalk.bold(formatLearnerName(responses.name))}! Thanks for taking 101 training today.`);
  }
}

Welcome.description = 'Welcome to Twilio 101 Training';

module.exports = Welcome;
module.exports.formatLearnerName = formatLearnerName;
