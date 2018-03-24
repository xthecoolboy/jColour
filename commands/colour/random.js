const {
	Command
} = require('discord.js-commando');
const config = require('./../../config/config.json');

const DBL = require("dblapi.js");
const dbl = new DBL(config.dblToken);

module.exports = class ChannelCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'random',
			group: 'colour',
			memberName: 'random',
			description: 'Gives you a random colour.',
			examples: ["random"],
			guildOnly: true,
			throttling: {
				usages: 2,
				duration: 10
			},
			aliases: [
				"rand",
				"randomcolour",
				"randomcol",
				"ran",
				"mix",
				"pick",
				"randomcolor",
				"randomcolours",
				"randomcolors"
			]
		});
	}

	async run(msg, args) {

		let prefix = this.client.commandPrefix;
		if (msg.guild) {
			prefix = msg.guild.commandPrefix;
		}

		const clientUser = this.client.user;


		// thats a nice bowl of spaghetti
		if (config.dblToken) {
			dbl.hasVoted(msg.author.id, 14).then(function (result) {
				if (!result) { // if user hasnt voted and dbl is enabled
					msg.say("Sorry, but to use this command you need to vote for the bot every 2 weeks at https://discordbots.org/bot/" + clientUser.id);
				} else {
					changeRoles(); // If user has voted and Discordbots.org listing is enabled
				}
			});
		} else {
			changeRoles(); // If DBL is not enabled
		}


		async function changeRoles() { // FUNCTION THAT CHANGES THE ROLES
			let colourRoles = []; // All colour roles
			let rolesToRemove = []; // Roles the user has
			msg.guild.roles.array().forEach(function (element) {
				if (element.name.startsWith("colour ")) {
					colourRoles.push(element);
					if (msg.member.roles.exists("id", element.id)) { //IF role is in members roles
						rolesToRemove.push(element);
					}

				}
			});

			const chosenRole = colourRoles[Math.floor(Math.random() * colourRoles.length)];

			let failed; // Prepare for spaghoot code

			// Updating the roles
			await msg.member.removeRoles(rolesToRemove, `jColour: Colour update (=> random, ${chosenRole.name})`).catch(function () {
				msg.say("I am missing permissions. My role should be the highest in the server's role list.");
				failed = true;
			});
			if (!failed) { // Spaghetti intensifies
				await msg.member.addRole(chosenRole).catch(function () {
					msg.say("I am missing permissions. My role should be the highest in the server's role list.");
					failed = true;
				});

				// Notify about role updates
				if (!failed) { // Oh god why would you put that there
					await msg.say("The (random) " + chosenRole.name + " has been added. Thanks for voting for me!")
				}
			}
		}




	}
}
