const {Command} = require('discord.js-commando');
const {stripIndents} = require('common-tags');

const {version, description} = require('./../../package.json');
const {formatMs} = require("./../../tools/formatms.js");

const os = require('os');
const Discord = require('discord.js');

module.exports = class ChannelCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'info',
			group: 'util',
			memberName: 'info',
			description: 'Fetches info related to the bot',
			examples: ["info", "info adding arguments is useless"],
			guildOnly: false,
			throttling: {
				usages: 2,
				duration: 10
			},
		});
	}

	async run(msg, args) {

		// Making shortcuts for ease of use
		const client = this.client;
		const me = client.user;
		
		let prefix = this.client.commandPrefix;
		if(msg.guild) {
			prefix = msg.guild.commandPrefix;
		}

		let embed = new Discord.RichEmbed()

		// Sets basic info for the embed
		.setTitle(`${me.username} info`)
		.setThumbnail(me.avatarURL)

		// Nice friendly blue
		.setColor("BLUE")

		.setDescription("Discord bot for managing colours")

		// Let's start adding some fields.

		.addField(
			"Stats",
			prefix + "stats",
			true
		)

		.addField(
			"Setup & Usage Tutorial",
			prefix + "tutorial",
			true
		)

		.addField(
			"Command list",
			prefix + "help",
			true
		)

		.addField(
			"Support Server",
			prefix + "support",
			true
		)

		.addField(
			"Owner",
			this.client.owners[0].tag,
			true
		)

		.addField(
			"Library",
			"discord.js",
			true
		)

		msg.embed(embed)
	}
};
