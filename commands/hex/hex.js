const {
	Command
} = require('discord.js-commando');
const nodeEnv = function () {
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
	checkHexPerms,
	giveHexRole,
	removeRole
} = require("../../tools/giveRole.js");

const {
	stripIndents
} = require('common-tags');

module.exports = class ChannelCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'hex',
			group: 'hex',
			memberName: 'hex',
			description: 'Gives you a hex colour or an X11 colour',
			examples: ["hex random", "hex blue", "hex #ffffff", "hex pick"],
			guildOnly: true,
			throttling: {
				usages: 2,
				duration: 10
			},
			format: '[hex/x11/"pick"/"random"]',
			args: [{
				key: 'colour',
				label: 'colour',
				prompt: "What colour do you want? Reply with a hex colour, an X11 colour, 'pick' or 'random'",
				error: "That is an invalid colour.",
				type: 'string',
				default: "",
			}]
		});
	}

	async run(msg, args) {

		let prefix = this.client.commandPrefix;
		if (msg.guild) {
			prefix = msg.guild.commandPrefix;
		}

		const requiredRoleId = msg.guild.settings.get('hexColor', "0");
		const requiredRole = msg.guild.roles.find("id", requiredRoleId);
		const requiredRoleName = requiredRole ? requiredRole.name : "";

		if (requiredRoleName) { // if hex colour role is found (= hex colours are set up)

			if (checkHexPerms(msg, this.client)) { // checks if user can use hex colours
				if (args.colour) { // argument supplied
					await giveHexRole(msg, this.client, prefix, args.colour);
				} else { // no argument --> help message 
					msg.say(stripIndents `**Hex Colours**
					Please provide a custom colour to use!

					I support two different formats for colours:
					• Hex Colours (https://htmlcolorcodes.com/color-picker/)
					• X11 colours (http://cng.seas.rochester.edu/CNG/docs/x11color.html)
					Additionally you can use \`pick\` and \`random\`
		
					Examples:
					• ${prefix}hex #ff00ff
					• ${prefix}hex cornflower
					• ${prefix}hex random
					• ${prefix}hex pick`)
				}
			} else { // no perms but hex role exists
				msg.say(`Sorry, but you don't have access to custom hex roles. You need the \`${requiredRoleName}\` role.`)
			}
		} else { // help message for setup (hex colours not set up yet)
			msg.say(stripIndents `**Hex Colours**

			You can let users make custom colour roles for themselves.
			*You need the \`manage roles\` permissions to enable this feature.*
			Type \`${prefix}enable-hex\` to continue.

			Custom hex colours can be deleted or disabled with \`${prefix}disable-hex\`.

			**Usage**

			I support two different formats for colours:
			• Hex Colours (https://htmlcolorcodes.com/color-picker/)
			• X11 colours (http://cng.seas.rochester.edu/CNG/docs/x11color.html)
			Additionally you can use \`pick\` and \`random\`

			Examples:
			• ${prefix}hex #ff00ff
			• ${prefix}hex cornflower
			• ${prefix}hex random
			• ${prefix}hex pick`)
		}
	}
};