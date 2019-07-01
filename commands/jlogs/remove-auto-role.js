const {Command} = require('discord.js-commando');
const sqlite = require('sqlite');

module.exports = class ChannelCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'remove-auto-role',
      group: 'jlogs',
      memberName: 'remove-auto-role',
      description: 'Removes the auto role (set-auto-role command)',
      examples: ["remove-auto-role", "remove-auto-role no arguments"],
      guildOnly: true,
      throttling: {
          usages: 2,
          duration: 10
      },
      aliases: [
        "remove-default-role",
        "remove-autorole",
        "removeautorole",
        "remove-logs-auto-role",
        "remove-logs-autorole"
      ]
    });
  }

  hasPermission(msg) {
    return msg.member.hasPermission('MANAGE_CHANNELS') || this.client.isOwner(msg.author);
  }

  async run(msg, args) {

    msg.guild.settings.remove("joinLogsAutoRole");
    msg.guild.settings.remove("joinLogsVerification");
    msg.guild.settings.remove("joinLogsVerificationLogs");
    msg.say("The Join Logs auto role has been removed.");



  }
};
