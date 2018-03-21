const {Command} = require('discord.js-commando');
const config = require('./../../config/config.json');

module.exports = class ChannelCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'colour',
			group: 'colour',
			memberName: 'colour',
			description: 'Gives you a list of colours. To get a colour use `colour <colour name>`',
			examples: ["colour <any name from the website>"],
			guildOnly: true,
			throttling: {
				usages: 2,
				duration: 10
			},
			aliases: [
				"color",
				"colours",
				"colors",
				"jcolor",
				"jcolour",
				"jcolors",
				"jcolours"
			],
			args: [
				{
					key: 'role',
					label: 'role',
					prompt: "What colour do you want?",
					type: 'role',
					default: ''
				}
			]
		});
	}

	async run(msg, args) {

		if(args.role) {
			if(args.role.name.toLowerCase().startsWith("colour ")) {
				
				let rolesToRemove = [];
				msg.member.roles.array().forEach(function(element) {
					if(element.name.startsWith("colour ") && element !== args.role) {
						rolesToRemove.push(element);
					}
				});
				msg.member.removeRoles(rolesToRemove, "jColour colour change");
				msg.member.addRole(args.role);
				
				msg.say("You have a role! " + args.role.name)
			} else {
				msg.say("That role is not a colour role: colour roles must start with the word 'colour'.")
			}
		} else {
			msg.say("Here's a list of all the roles: " + config.base_www + msg.guild.id);
		}



	}
};
