const {Command} = require('discord.js-commando');
const config = require('./../../config/config.json');

module.exports = class ChannelCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'support',
			group: 'util',
			memberName: 'support',
			description: 'Gives the link for support',
			examples: ["support", "support there are no arguments smh"],
			guildOnly: false,
			throttling: {
				usages: 2,
				duration: 10
			},
			aliases: [
				"supp",
				"discord"
			]
		});
	}

	async run(msg, args) {

		msg.say(`Here's the link to get support: ${config.support}`) 

	}
};
