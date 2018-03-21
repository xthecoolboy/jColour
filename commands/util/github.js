const {Command} = require('discord.js-commando');

module.exports = class ChannelCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'github',
			group: 'util',
			memberName: 'github',
			description: 'Take a look at my code.',
			examples: ["github", "github there are no arguments smh"],
			guildOnly: false,
			throttling: {
				usages: 2,
				duration: 10
			},
			aliases: [
				"git",
				"gh",
				"source",
				"code",
				"sourcecode"
			]
		});
	}

	async run(msg, args) {

		msg.say(`Here's the link to my repository: https://github.com/jaqreven/jColour`);

	}
};
