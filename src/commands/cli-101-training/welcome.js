const { flags } = require('@oclif/command');
const {Command} = require('@oclif/command');
const {cli} = require ('cli-ux');
const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;
const { TwilioCliError } = require('@twilio/cli-core').services.error;
const chalk = require('chalk');

class welcome extends TwilioClientCommand {
  
  async run() {
    const welcome = chalk.bold('>>>>>  ') + chalk.underline.bold('WELCOME TO TWILIO 101 TRAINING') + chalk.bold('  <<<<<');
    console.log();
    console.log('*************************************************************************');
    console.log('*                                                                       *');
    console.log(`*          ${welcome}          *`);
    console.log('*                                                                       *');
    console.log('*     twilio login                                                      *');
    console.log('*                                                                       *');
    console.log('*     OR                                                                *');
    console.log('*                                                                       *');
    console.log('*     twilio profiles:create                                            *');
    console.log('*                                                                       *');
    console.log('*************************************************************************');
    console.log();



  const name = await cli.prompt('What is your name?');

  console.log("Hello " + chalk.bold(name) + "! thanks for taking 101 training today");
}

}

welcome.description =
  "Welcome to Twilio 101 Training";

module.exports = welcome;
