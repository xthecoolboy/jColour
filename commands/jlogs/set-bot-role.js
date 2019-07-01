const {Command} = require('discord.js-commando');
const sqlite = require('sqlite');

module.exports = class ChannelCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'set-bot-role',
      group: 'jlogs',
      memberName: 'set-bot-role',
      description: 'Sets the role given to bots on join',
      examples: ["set-bot-role Bots", "set-bot-role beep"],
      guildOnly: true,
      throttling: {
          usages: 2,
          duration: 10
      },
      aliases: [
        "set-botrole",
        "setbotrole",
        "set-logs-bot-role",
        "set-logs-botrole"
      ],
      args: [
        {
          key: 'role',
          label: 'role',
          prompt: "What role should be given to bots on join?",
          type: 'role',
        }
      ]
    });
  }

  hasPermission(msg) {
    return msg.member.hasPermission('MANAGE_CHANNELS') || this.client.isOwner(msg.author);
  }

  async run(msg, args) {

    msg.guild.settings.set("joinLogsBotRole", args.role.id);
    msg.say("The Join Logs bot role has been updated to " + args.role.name);


  }
};
