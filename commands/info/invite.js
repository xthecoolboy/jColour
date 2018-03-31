const {Command} = require('discord.js-commando');

module.exports = class ChannelCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'invite',
			group: 'info',
			memberName: 'invite',
			description: 'Gives the link to invite me ',
			examples: ["invite", "invite there are no arguments smh"],
			guildOnly: false,
			throttling: {
				usages: 2,
				duration: 10
			},
			aliases: [
				"inv",
				"add"
			]
		});
	}

	async run(msg, args) {

		const inviteLink = `https://discordapp.com/oauth2/authorize?client_id=${this.client.user.id}&scope=bot&permissions=268454912`;
		msg.say(`Here's the link to invite me: <${inviteLink}>`) 

	}
};
