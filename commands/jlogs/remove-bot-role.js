const {Command} = require('discord.js-commando');
const sqlite = require('sqlite');

module.exports = class ChannelCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'remove-bot-role',
      group: 'jlogs',
      memberName: 'remove-bot-role',
      description: 'Removes the bot role (set-bot-role command)',
      examples: ["remove-bot-role", "remove-bot-role no arguments"],
      guildOnly: true,
      throttling: {
          usages: 2,
          duration: 10
      },
      aliases: [
        "remove-botrole",
        "removebotrole",
        "remove-logs-bot-role",
        "remove-logs-botrole"
      ]
    });
  }

  hasPermission(msg) {
    return msg.member.hasPermission('MANAGE_CHANNELS') || this.client.isOwner(msg.author);
  }

  async run(msg, args) {

    msg.guild.settings.remove("joinLogsBotRole");
    msg.say("The Join Logs bot role has been removed.");



  }
};
