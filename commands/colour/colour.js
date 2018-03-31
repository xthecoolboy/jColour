const {
	Command
} = require('discord.js-commando');
const config = require('./../../config/config.json');

const {
	giveRole,
	giveRandomRole,
	giveSuitableRole,
	checkDbl
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

		const clientUser = this.client;

		if (!args.role) {
			await msg.say(stripIndents `Here's a list of all the colours: ${config.base_www}${msg.guild.id}
			
			Use \`${prefix}colour <colour name>\` 
			For a random colour, try \`${prefix}colour random\`
			Get the best colour for your avatar: \`${prefix}colour pick\`
			You can also get rid of all colours with \`${prefix}colour none\``)
		} else {

			if (args.role === "random") {

				/*

				RANDOM ROLE 

				*/
				// if (checkDbl(msg, clientUser)) {
					giveRandomRole(msg, prefix);
				/* } else {
					msg.say("Sorry, but to use this command you need to vote for the bot every month at https://discordbots.org/bot/" + clientUser.user.id);
				} */

			} else if (["suitable", "pick", "choose"].includes(args.role)) {

				/*

				PICKS A COLOR FROM AVATAR

				*/

				if (checkDbl(msg, clientUser)) {
					giveSuitableRole(msg, prefix);
				} else {
					msg.say("Sorry, but to use this command you need to vote for the bot every month at https://discordbots.org/bot/" + clientUser.user.id);
				}

			} else if (["none", "remove"].includes(args.role)) {
				giveRole(msg)
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
};