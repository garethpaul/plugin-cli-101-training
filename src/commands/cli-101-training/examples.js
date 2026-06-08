const { Command, flags } = require('@oclif/command');
const chalk = require('chalk');
const clipboardy = require('clipboardy');
const inquirer = require('inquirer');

const EXAMPLE_COMMANDS = {
  sms: `twilio api:core:messages:create \\
  --to +15555550100 \\
  --from +15555550101 \\
  --body "Ahoy from CLI 101 training" \\
  -o json`,
  email: `twilio email:send \\
  --to test@example.com \\
  --from sender@example.com \\
  --subject "Message log" \\
  --text "Message log"`,
  debugger: 'twilio debugger:logs:list',
  plugins: 'twilio plugins',
  'phone-numbers': 'twilio phone-numbers:search:local --country-code US --area-code 415',
  webhook: 'twilio phone-numbers:update <YOUR_TWILIO_NUMBER> --sms-url=https://example.com/twilio/sms'
};

const EXAMPLE_CHOICES = Object.keys(EXAMPLE_COMMANDS);

class Examples extends Command {
  static flags = {
    example: flags.string({
      char: 'e',
      description: 'training example to copy',
      options: EXAMPLE_CHOICES
    })
  };

  async run() {
    const { flags } = this.parse(Examples);
    let example = flags.example;

    if (!example) {
      const responses = await inquirer.prompt([{
        name: 'example',
        message: 'Select an example',
        type: 'list',
        choices: EXAMPLE_CHOICES.map(name => ({ name }))
      }]);
      example = responses.example;
    }

    const command = EXAMPLE_COMMANDS[example];
    this.log(`Here is an example command for ${chalk.bold(example)}:`);
    this.log(command);
    this.log('Review before running: phone numbers and URLs are placeholders.');

    try {
      clipboardy.writeSync(command);
      this.log('Copied the example command to the clipboard.');
    } catch (error) {
      this.log(`Clipboard copy skipped: ${error.message}`);
    }
  }
}

Examples.description = 'Twilio 101 training examples';

module.exports = Examples;
