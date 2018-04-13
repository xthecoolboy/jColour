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
const dbl = new DBL(config.dblToken, {
	webhookPort: 5000,
	webhookAuth: config.dblWebAuth
});

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
`);

	client.user.setActivity(client.commandPrefix + "colours |  v" + version + " / " + description, {
			type: 'WATCHING'
		})
		.then(presence => console.log(`Activity set.`))
		.catch(console.error);

	setInterval(() => {

		if (config.dblToken) { //discordbots.org
			dbl.postStats(client.guilds.size);
			console.log("Discordbots.org stats posted! Server count: " + client.guilds.size)
		}

		if (config.dbotsToken) { // bots.discord.pw
			dbots.postBotStats(client.user.id, {
				"server_count": client.guilds.size
			});
			console.log("Bots.discord.pw stats posted! Server count: " + client.guilds.size)
		}

	}, 1800000);

	/*client.user.setUsername('jColour Alpha');
  client.user.setAvatar('./avatar.png')*/

	// Sorry I wanted to update bot info, left it there  ^

});

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

/*

WEB SERVER PART

*/

// Things we need for the web server
const express = require('express');
const app = express();
const port = process.env.PORT || config.port;
const helmet = require('helmet');
const morgan = require("morgan");
const tinycolor = require("tinycolor2");

const middleware = [
	helmet(),
	morgan('tiny'), // Logs request data to console
	express.static('public') // public dir can be accessed
]

app.set('view engine', 'ejs'); // ejs for server side js templating
app.use(middleware);

// routes ======================================================================


// redirect to bot inv
app.get('/invite', function (req, res) {
	res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=268454912`)
});

app.get('/support', function (req, res) { // Support guild
	res.redirect(config.support)
});

app.get('/demo', function (req, res) { // Demo guild
	res.redirect("/358971438964801557")
});

app.get('/video', function (req, res) { // Tutorial video
	res.redirect("https://www.youtube.com/watch?v=AqXlkReI_QU&feature=youtu.be")
});

// index page
app.get('/', function (req, res) {
	res.render('index.ejs', {
		registry: client.registry
	});
});

// colour page: sends server as a var
app.get('/:id', function (req, res) {

	res.render('colour.ejs', {
		server: client.guilds.find("id", req.params.id),
		tinycolor: tinycolor
	})

});

// 404 (/css, /js etc)
app.use(function (req, res) {
	res.status(404).render('error.ejs', {
		errorNum: 404,
		errorMsg: "File not found."
	})
});

// starts listening to requests
app.listen(port);
console.log('Listening to requests on port ' + port);

/*

WEBHOOK PART

*/

if (config.dblWebAuth) {

	dbl.webhook.on('ready', hook => {
		console.log(`Webhook running at http://${hook.hostname}:${hook.port}${hook.path}`);
	});
	dbl.webhook.on('vote', vote => {
		if (vote["type"] === "test") {
			console.log("Received webhook test!");
			console.log(vote);
		}
		if (vote["bot"] === client.user.id && vote["type"] === "upvote") {
			client.settings.set(`vote-${vote["user"]}`, new Date())
		};
	});

}