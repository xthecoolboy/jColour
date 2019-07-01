const {Command} = require('discord.js-commando');
const sqlite = require('sqlite');

module.exports = class ChannelCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'set-logs-channel',
      group: 'jlogs',
      memberName: 'set-logs-channel',
      description: 'Sets the join logs channel',
      examples: ["set-logs-channel #general", "set-logs-channel #join-logs"],
      guildOnly: true,
      throttling: {
          usages: 2,
          duration: 10
      },
      aliases: [
        "set-log-channel",
        "join-logs-channel",
        "set-logs-channel",
        "set-join-logs-channel"
      ],
      args: [
        {
          key: 'channel',
          label: 'channel',
          prompt: "What channel should the messages get sent to?",
          type: 'channel',
        }
      ]
    });
  }

  hasPermission(msg) {
    return msg.member.hasPermission('MANAGE_CHANNELS') || this.client.isOwner(msg.author);
  }

  async run(msg, args) {

    msg.guild.settings.set("joinLogsChannel", args.channel.id);
    msg.say("The Join Logs channel has been updated to " + args.channel);

  }
};
