const {Command} = require('discord.js-commando');
const sqlite = require('sqlite');

module.exports = class ChannelCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'remove-logs',
      group: 'jlogs',
      memberName: 'remove-logs',
      description: 'Removes the join logs.',
      examples: ["remove-auto-role", "remove-auto-role no arguments"],
      guildOnly: true,
      throttling: {
          usages: 2,
          duration: 10
      },
      aliases: [
        "remove-logs-channel",
        "remove-log-channel",
        "deletelogs",
        "delete-logs",
        "removelogs",
        "remove-logs-channel",
        "remove-logchannel"
      ]
    });
  }

  hasPermission(msg) {
    return msg.member.hasPermission('MANAGE_CHANNELS') || this.client.isOwner(msg.author);
  }

  async run(msg, args) {

    msg.guild.settings.remove("joinLogsChannel");
    msg.guild.settings.remove("joinLogsAutoRole");
    msg.guild.settings.remove("joinLogsBotRole");
    msg.say("The Join Logs have been removed.");



  }
};
