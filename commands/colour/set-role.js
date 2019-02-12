const {
    Command
} = require('discord.js-commando');
const nodeEnv = function() {
  switch (process.env.NODE_ENV) {
    case 'development':
      return 'development';
    case 'default':
      return 'default';
    default:
      return 'default';
  };
};
const config = require('./../../config/config.json')[nodeEnv()];

const {
    giveRole,
    giveRandomRole,
    giveSuitableRole,
    checkDbl,
    checkHexPerms,
    giveHexRole
} = require("./../../tools/giveRole.js");

const {
    stripIndents
} = require('common-tags');

module.exports = class ChannelCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'set-role',
            group: 'colour',
            memberName: 'set-role',
            description: 'Restricts colours to a certain role (everyone for no limits)',
            examples: ["enable-hex Admin", "enable-hex everyone"],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 10
            },
            format: '[role/"everyone"]',
            aliases: [
                "setrole"
            ],
            args: [{
                key: 'role',
                label: 'role',
                prompt: "What role should all colours be limited to? (Reply with 'everyone' for no limits)",
                error: "That is an invalid role.",
                type: 'role'
            }]
        });
    }

    hasPermission(msg) {
        return msg.member.hasPermission('MANAGE_ROLES') || this.client.isOwner(msg.author);
    }

    async run(msg, args) {

        let prefix = this.client.commandPrefix;
        if (msg.guild) {
            prefix = msg.guild.commandPrefix;
        }

        if (args.role.name === "@everyone") {
            msg.guild.settings.remove('color-role');
            msg.say("Everyone can use the colour commands now.")
        } else {
            msg.guild.settings.set('color-role', args.role.id);
            msg.say(`Only the role ${args.role.name} can use colour commands now.`)
        }

    }
};
