const { Command } = require('@oclif/core');

class Feedback extends Command {
  async run() {
    this.log('>>> https://twil.io/twilio-cli-feedback');
  }
}

Feedback.description = 'Share feedback for Twilio 101 Training';

module.exports = Feedback;
