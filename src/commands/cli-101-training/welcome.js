const { Command } = require('@oclif/core');
const chalk = require('chalk');
const inquirer = require('inquirer');

const LEARNER_NAME_MAX_LENGTH = 80;
const BIDI_CONTROL_RE = /[\u202A-\u202E\u2066-\u2069]/g;

function formatLearnerName(value) {
  const rawName = value === undefined || value === null ? '' : String(value);
  const name = rawName
    .replace(/[\x00-\x1F\x7F]/g, '')
    .replace(BIDI_CONTROL_RE, '')
    .trim();
  return (name || 'there').slice(0, LEARNER_NAME_MAX_LENGTH);
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
