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
					prompt: "What colour do you want? Run the command again without an argument to see the list.",
					type: 'role',
					default: ""
				}
			]
		});
	}

	async run(msg, args) {

		if(args.role) { // If a role is specified in the argument
			if(args.role.name.toLowerCase().startsWith("colour ")) { // Only colour roles allowed!
				let rolesToRemove = []; // Init array for roles to remove

				// Loop through roles and filter
				msg.member.roles.array().forEach(function(element) {
					if(element.name.startsWith("colour ")) {
						rolesToRemove.push(element);
					}
				});

				// Updating the roles
				msg.member.removeRoles(rolesToRemove, `jColour: Colour update (=> ${args.role.name})`);
				msg.member.addRole(args.role);
				
				// Notify about role updates
				msg.say("The colour " + args.role.name + " has been added.")
				
			} else { // Role is not a colour role
				msg.say("That role is not a colour role: colour roles must start with the word 'colour'.")
			}
		} else { // User didn't supply a role
			msg.say("Here's a list of all the colours: " + config.base_www + msg.guild.id + "\nUse `j!colour <colour name>`");
		}



	}
};
