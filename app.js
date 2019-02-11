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

client.getGuildData = function (id) { // server is a circular object so I have to make my own object
	const guild = client.guilds.find("id", id);
	if (guild) {
		const json = { // Guild name and empty array
			"name": guild.name,
			"roles": []
		};
		const colourRoles = guild.roles.array().filter( // only colour roles
			role =>
			role.name.toLowerCase().startsWith("colour ") &&
			!(role.name.toLowerCase().startsWith("colour u-"))
		);
		colourRoles.forEach(role => // push each role into array
			json["roles"].push({
				"name": role.name,
				"colour": role.hexColor,
				"id": role.id
			})
		)
		return json; // return json
	} else {
		return false; // return false so the main process knows which one to pick
	}
}

client.getUserAndGuildData = function (id, guildid) {
	const user = client.users.find("id", id);
	const guild = client.guilds.find("id", guildid);
	if (user && guild) {
		const member = guild.members.get(id)
		const coloursRole = guild.settings.get('color-role');
		const hexColoursRole = guild.settings.get('hexColor');
		const perms = member ? member.hasPermission("MANAGE_ROLES") : false;
		return {
			"manageRoles": perms,
			"avatar": user.displayAvatarURL,
			"name": user.username,
			"tag": user.tag,
			"canUseColours": coloursRole ? member.roles.exists('id', coloursRole) : true,
			"canUseHex": hexColoursRole ? member.roles.exists("id", hexColoursRole) : false,
			"theme": client.settings.get("dark-theme-" + user.id, false)
		}
	} else {
		return client.getUserData(id)
	}
}

client.getUserData = function (id) {
	const user = client.users.find("id", id);
	if (user) {
		return {
			"avatar": user.displayAvatarURL,
			"name": user.username,
			"tag": user.tag,
			"theme": client.settings.get("dark-theme-" + user.id, false)
		}
	} else {
		return false;
	}
}

client.getCommandData = function () { // we need to get command data this way too
	const json = []
	client.registry.commands.filter( // no eval commands
		command => !([
			"eval"
		].includes(command.name))
	).forEach(command => json.push( // every commands name format desc and group
		{
			"name": command.name,
			"format": command.format,
			"desc": command.description,
			"group": command.group.name
		}
	))
	return json;
}

client.getAllServers = function (options) {
	const json = []
	client.guilds.forEach(function (guild) {
		const colourRoles = guild.roles.array().filter( // only colour roles
			role =>
			role.name.toLowerCase().startsWith("colour ") &&
			!(role.name.toLowerCase().startsWith("colour u-"))
		);

		const roles = colourRoles.map(role => // push each role into array
			({
				"name": role.name,
				"colour": role.hexColor,
				"id": role.id
			})
		)

		let allRoles;
		if (options.allroles) {
			const actualRoles = guild.roles.array().filter(
				role => !role.name.toLowerCase().startsWith("colour ") && !role.managed
			)
			allRoles = actualRoles.map(role => ({
				"name": role.name,
				"id": role.id
			}))
		}

		json.push({
			"hexRole": guild.settings.get('hexColor'),
			"name": guild.name,
			"id": guild.id,
			"iconurl": guild.iconURL ? guild.iconURL : "https://discordapp.com/assets/81d74b2ebb053fbccee41865a47d48c3.svg",
			"roles": roles,
			"allroles": options.allroles ? allRoles : null,
			"restrictRole": guild.settings.get('color-role')
		})

	})
	return json;
}

client.updateTheme = function (id) {
	const darktheme = client.settings.get("dark-theme-" + id, false)
	client.settings.set("dark-theme-" + id, darktheme ? false : true)
}

client.handleWebhook = function (type, bot, user) { // handles webhooks for each shard
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
