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
	giveHexRole,
	removeRole
} = require("./../../tools/giveRole.js");

const {
	stripIndents
} = require('common-tags');

module.exports = class ChannelCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'colour',
			group: 'colour',
			memberName: 'colour',
			description: 'Gives you a list of colours (if no arguments) or gives you a colour.',
			examples: ["colour <any name from the website>", "colour random", "colour pick"],
			guildOnly: true,
			throttling: {
				usages: 2,
				duration: 10
			},
			format: '[role/"pick"/"random"/"none"]',
			aliases: [
				"color",
				"colours",
				"colors",
				"jcolor",
				"jcolour",
				"jcolors",
				"jcolours"
			],
			args: [{
				key: 'role',
				label: 'role',
				prompt: "What colour do you want? Run the command again without an argument to see the list.",
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

		const requiredRoleId = msg.guild.settings.get('hexColor-role', "0");
		const requiredRole = msg.guild.roles.find("id", requiredRoleId);
		const requiredRoleName = requiredRole ? requiredRole.name : "";

		const requiredTotalRoleId = msg.guild.settings.get('color-role', null);
		const requiredTotalRole = msg.guild.roles.find("id", requiredTotalRoleId);
		const requiredTotalRoleName = requiredTotalRole ? requiredTotalRole.name : "";
		const totalAccess = requiredTotalRoleId ? msg.member.roles.has(requiredTotalRole.id) : true;

		const clientUser = this.client;

		const customColourNotif = checkHexPerms(msg, clientUser) ? `\nYou can get a custom colour with \`${prefix}colour hex <hex colour>\`.` : "";

		if (!totalAccess) {
			await msg.say("Sorry, but to use the colour command you need the `" + requiredTotalRoleName + "` role. Admins: " + prefix + "set-role")
		} else {
			if (!args.role) {
				await msg.say(stripIndents `Here's a list of all the colours: ${config.base_www}${msg.guild.id}

			Use \`${prefix}colour <colour name>\` 
			For a random colour, try \`${prefix}colour random\`
			Get the best colour for your avatar: \`${prefix}colour pick\`
			You can also get rid of all colours with \`${prefix}colour none\`
			${customColourNotif}`)
			} else {

				if (args.role.toLowerCase() === "random") {

					/*

					RANDOM ROLE 

					*/
					// if (checkDbl(msg, clientUser)) {
					giveRandomRole(msg, prefix);
					/* } else {
						msg.say("Sorry, but to use this command you need to vote for the bot every month at https://discordbots.org/bot/" + clientUser.user.id);
					} */

				} else if (["suitable", "pick", "choose"].includes(args.role.toLowerCase())) {

					/*

					PICKS A COLOR FROM AVATAR

					*/

					if (checkDbl(msg, clientUser)) {
						giveSuitableRole(msg, prefix);
					} else {
						msg.say("Sorry, but to use this command you need to vote for the bot every month at https://discordbots.org/bot/" + clientUser.user.id);
					}

				} else if (["none", "remove"].includes(args.role)) {
					removeRole(msg)
				} else if (args.role.toLowerCase() === "hex") { // HEX INFORMATION

					msg.say(stripIndents `**Hex Colours: Setup**

				You can allow users to make custom colour roles for themselves.
				*You need \`manage roles\` permissions for this!*

				By typing \`${prefix}enable-hex\` you will enable the custom colours.
				When you run the command, I will ask you if you want to limit custom hex colours to a certain role.
				
				Custom hex colours can be deleted later with \`${prefix}disable-hex\`.
				When you run the command, I will ask if you want to delete the custom hex colour roles.
				
				**Hex Colours: Usage**
				
				The hex colour needs to be in #xxxxxx format (ex. #ff00ff is pink).
				After you've got a hex colour, type \`${prefix}colour hex <hex colour>\`
				You can also use \`${prefix}colour hex pick/random\`.`)

				} else if (args.role.toLowerCase().startsWith("hex ")) {

					const colour = args.role.split(" ")[1];
					if (checkHexPerms(msg, clientUser)) {
						await giveHexRole(msg, clientUser, prefix, colour);
					} else {
						if (requiredRoleName) {
							msg.say(`Sorry, but you don't have access to custom hex roles. You need the ${requiredRoleName} role.`)
						} else {
							msg.say(`Custom hex roles are not enabled. Ask an admin to run \`${prefix}colour hex\` and \`${prefix}enable-hex\`.`)
						}

					}

				} else {

					// Gets a role by string, converts it to lower case. All role names are converted to lower case too.
					const chosenRole = msg.guild.roles.find(val => val.name.toLowerCase() === "colour " + args.role.toLowerCase());
					if (!chosenRole) { // chosenRole is null (doesnt exist)
						msg.say("That colour doesn't exist!")
					} else {

						/*

						EVERYTHING WAS SUCCESSFUL 
					
						*/

						giveRole(msg, chosenRole);


					}
				}
			}
		}
	}
};