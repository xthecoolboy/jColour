const Discord = require('discord.js');
const Commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path = require('path');
const {
	version,
	description
} = require('./package.json');
const config = require('./config/config.json');

const DBL = require("dblapi.js");
const dbl = new DBL(config.dblToken);

const DiscordBots = require('discordbots');
const dbots = new DiscordBots(config.dbotsToken);

// Init client
const client = new Commando.Client({
	owner: config.ownerid,
	commandPrefix: config.prefix,
	disableEveryone: true,
	unknownCommandResponse: false
});

client.registry
	// Registers your custom command groups
	.registerGroups([
		['colour', 'Colour'],
		['info', 'Information']
	])

	// Registers all built-in groups, some commands, and argument types
	.registerDefaultGroups()
	.registerDefaultTypes()
	.registerDefaultCommands({
		help: false,
		prefix: false,
		eval_: true,
		ping: false,
		commandState: false
	})

	// Registers all of your commands in the ./commands/ directory
	.registerCommandsIn(path.join(__dirname, 'commands'));


	
client.on('ready', () => {
	console.log(`\nLogged in:
Bot: ${client.user.tag} / ${client.user.id} / v${version} (Codename ${description})

Shard: ${client.shard.id} (count ${client.shard.count})
`);

	client.user.setActivity(client.commandPrefix + "colours |  v" + version + " / " + description + " | " + client.shard.id, {
			type: 'WATCHING'
		})
		.then(presence => console.log(`Activity set.`))
		.catch(console.error);

	setInterval(() => {

		if (config.dblToken) { //discordbots.org
			dbl.postStats(client.guilds.size, client.shard.id, client.shard.count);
			console.log("Discordbots.org stats posted! Server count: " + client.guilds.size)
		}

		/* if (config.dbotsToken) { // bots.discord.pw
			dbots.postBotStats(client.user.id, {
				"server_count": client.guilds.size
			});
			console.log("Bots.discord.pw stats posted! Server count: " + client.guilds.size)
		} */

	}, 1800000);

	/*client.user.setUsername('jColour Alpha');
  client.user.setAvatar('./avatar.png')*/

	// Sorry I wanted to update bot info, left it there  ^

});

client.getGuildData = function (id) {
	const guild = client.guilds.find("id", id);
	if (guild) {
		const json = {
			"name": guild.name,
			"roles": []
		};
		const colourRoles = guild.roles.array().filter(
			role =>
			role.name.toLowerCase().startsWith("colour ") &&
			!(role.name.toLowerCase().startsWith("colour u-"))
		);
		colourRoles.forEach(role => 
			json["roles"].push({
				"name": role.name,
				"colour": role.hexColor,
				"id": role.id
			})
		)
		return json;
	} else {
		return false;
	}
}

client.getCommandData = function () {
	const json = []
	client.registry.commands.filter(
		command => !([
			"eval"
		].includes(command.name))
	).forEach(command => json.push(
		{
			"name": command.name,
			"format": command.format,
			"desc": command.description,
			"group": command.group.name
		}
	))
	return json;
}

client.handleWebhook = function (type, bot, user) {
	if (type === "test") {
		console.log("Received webhook test!");
	}
	if (bot === client.user.id && type === "upvote") {
		client.settings.set(`vote-${user}`, new Date())
	};
}

client.setProvider( // Sqlite database for prefixes and such
	sqlite.open(path.join(__dirname, 'settings.sqlite3')).then(db => new Commando.SQLiteProvider(db))
).catch(console.error);

client.on('guildMemberAdd', member => {

	// This is the default role
	const autoRole = member.guild.roles.find("name", "colour default");

	if (autoRole) { // If the role exists (otherwise null)

		member.addRole(autoRole, `jColour: Join role (=> ${autoRole.name})`);

	}
});

client.on('commandRun', command => {

	// Logs the command in cyan
	console.log('\x1b[36m%s\x1b[0m', "CMD " + command.name + " / " + command.group.name)
});


client.login(config.token); // Logins to the api