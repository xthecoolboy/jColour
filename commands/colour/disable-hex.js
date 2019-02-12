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
			name: 'disable-hex',
			group: 'colour',
			memberName: 'disable-hex',
			description: 'Disables custom hex colours from the server. Can also delete the custom colours.',
			examples: ["disable-hex Admin", "disable-hex everyone"],
			guildOnly: true,
			throttling: {
				usages: 2,
				duration: 10
			},
			format: '[delete: "yes"/"no"]',
			aliases: [
				"disablehex"
			],
			args: [{
				key: 'removeRoles',
				label: 'removeRoles',
				prompt: "Would you like to delete existing custom colours? Reply with either `yes` or `no`.",
				error: "thats not a string what",
				type: 'string'
			}]
		});
	}

	hasPermission(msg) {
		return msg.member.hasPermission('MANAGE_ROLES') || this.client.isOwner(msg.author);
	}

	async run(msg, args) {

		const userRoles = msg.guild.roles.filter(role => role.name.startsWith("colour u-"));

		msg.guild.settings.remove('hexColor');
		msg.guild.settings.remove('hexColor-role');

		if (args.removeRoles.toLowerCase() === "yes") {
			userRoles.deleteAll()
			msg.say(`Custom hex colours have been disabled and existing custom colours have been removed.`)
		} else {
			msg.say(`Custom hex colours have been disabled.`)
		}

	}
};
