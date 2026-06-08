const { Command } = require('@oclif/command');
const chalk = require('chalk');
const inquirer = require('inquirer');

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

    this.log(`Hello ${chalk.bold(responses.name)}! Thanks for taking 101 training today.`);
  }
}

Welcome.description = 'Welcome to Twilio 101 Training';

module.exports = Welcome;
