const {
    Command
} = require('discord.js-commando');
const config = require('./../../config/config.json');

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
            name: 'enable-hex',
            group: 'colour',
            memberName: 'enable-hex',
            description: 'Enables custom hex colours for the server (can be limited to a role)',
            examples: ["enable-hex Admin", "enable-hex everyone"],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 10
            },
            format: '[role/"everyone"]',
            aliases: [
                "enablehex"
            ],
            args: [{
                key: 'role',
                label: 'role',
                prompt: "What role should this be limited to? (Reply with 'everyone' for no limits)",
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

        msg.guild.settings.set('hexColor', args.role.id);
        if (args.role.name === "@everyone") {
            msg.say(`Custom hex colours have been enabled. Use \`${prefix}colour hex <hex colour>\` to get a custom hex colour. \`Everyone\` can get one. Please note that Discord has a hard limit on roles.`)
        } else {
            msg.say(`Custom hex colours have been enabled. Use \`${prefix}colour hex <hex colour>\` to get a custom hex colour. Only people with the role \`${args.role.name}\` can get one. Please note that Discord has a hard limit on roles.`)
        }

    }
};