const {Command} = require('discord.js-commando');

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

module.exports = class ChannelCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'support',
			group: 'info',
			memberName: 'support',
			description: 'Gives the link to my support server.',
			examples: ["support", "support there are no arguments smh"],
			guildOnly: false,
			throttling: {
				usages: 2,
				duration: 10
			},
			aliases: [
				"support",
				"plshelp"
			]
		});
	}

	async run(msg, args) {

		msg.say(`Here's the link to my support server: <${config.support}>`)

	}
};
