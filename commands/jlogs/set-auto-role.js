const {Command} = require('discord.js-commando');
const sqlite = require('sqlite');

module.exports = class ChannelCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'set-auto-role',
      group: 'jlogs',
      memberName: 'set-auto-role',
      description: 'Sets the role given to members on join',
      examples: ["set-auto-role Members", "set-auto-role Guys"],
      guildOnly: true,
      throttling: {
          usages: 2,
          duration: 10
      },
      aliases: [
        "set-default-role",
        "set-autorole",
        "setautorole",
        "set-logs-auto-role",
        "set-logs-autorole"
      ],
      args: [
        {
          key: 'role',
          label: 'role',
          prompt: "What role should be given to members on join?",
          type: 'role',
        }
      ]
    });
  }

  hasPermission(msg) {
    return msg.member.hasPermission('MANAGE_CHANNELS') || this.client.isOwner(msg.author);
  }

  async run(msg, args) {

    msg.guild.settings.set("joinLogsAutoRole", args.role.id);
    msg.say("The Join Logs auto role has been updated to " + args.role.name);


  }
};
