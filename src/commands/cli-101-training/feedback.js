const { flags } = require('@oclif/command');
const {Command} = require('@oclif/command');
const {cli} = require ('cli-ux');
const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;
const { TwilioCliError } = require('@twilio/cli-core').services.error;
const chalk = require('chalk');

class feedback extends TwilioClientCommand {
  
    constructor(argv, config, secureStorage) {
        super(argv, config, secureStorage);
    
        this.showHeaders = true;
        this.latestLogEvents = [];
      }

  async run() {

    await super.run();
    console.log(">>> https://twil.io/twilio-cli-feedback")
    //console.log("Hello " + chalk.bold(name) + "! thanks for taking 101 training today");
    }

}

feedback.description =
  "Welcome to Twilio 101 Training";

module.exports = feedback;
