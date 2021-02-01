const { flags } = require('@oclif/command');
const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;
const { TwilioCliError } = require('@twilio/cli-core').services.error;
const {Command} = require('@oclif/command');
const inquirer = require("inquirer");
const clipboardy = require('clipboardy');
const chalk = require('chalk');


class examples extends Command {
    static flags = {
      stage: flags.string({options: ['development', 'staging', 'production']})
    }
  
    async run() {

      const {flags} = this.parse(examples);
      let example = flags.stage;
      if (!example){

        // ask user which position the employee is
        let responses = await inquirer.prompt([{
          name: 'example',
          message: 'select a example',
          type: 'list',
          choices: [{name: 'sms'},
                    {name: 'email'},
                    {name: 'debugger'},
                    {name: 'plugins'},
                    {name: 'phone-numbers'},
                    {name: 'webhook'},
                  ],
        }])
        example = responses.example
      }

      if (example == "sms") {
        const cmd = `twilio api:core:messages:create \
        --to +12127363100 \
        --from +14155551212 \
        --body "Ahoy" \
        -o json
        `;
        console.log("Here is an example command - ", chalk.bold('twilio api:core:messages:create'))
        clipboardy.writeSync(cmd);
      }

      if (example == "email") {
        const cmd = `
        twilio email:send \
          --to 'test@example.com'\
          --from 'sender@example.com'\
          --subject='Message log'\
          --text 'Message log'
        `
        console.log("Here is an example command - ", chalk.bold('twilio email:send'))
        clipboardy.writeSync(cmd);
      }

      if (example == "debugger") {
        const cmd = `twilio debugger:logs:list`
        console.log("Here is an example command - ", chalk.bold('twilio debugger:logs:list'))
        clipboardy.writeSync(cmd);
      }

      if (example == "plugins") {
        const cmd = `twilio watch`
        console.log("Here is an example command - ", chalk.bold(cmd))
        clipboardy.writeSync(cmd);
      }

      if (example == "phone-numbers") {
        const cmd = `twilio phone-numbers:buy:local --country-code US`
        console.log("Here is an example command - ", chalk.bold(cmd))
        clipboardy.writeSync(cmd);
      }


      if (example == "webhook") {
        const cmd = `twilio phone-numbers:update +12107574383 --sms-url=https://localhost:8000`
        console.log("Here is an example command - ", chalk.bold(cmd))
        clipboardy.writeSync(cmd);
      }

      



      

     

            
    }
}

examples.description =
  "Twilio 101 Examples";

module.exports = examples;