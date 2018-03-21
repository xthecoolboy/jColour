const Discord = require('discord.js');
const Commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path = require('path');
const {version, description} = require('./package.json');
const config = require('./config/config.json');


const client = new Commando.Client({
	owner: config.ownerid,
	commandPrefix: config.prefix,
	disableEveryone: true,
	unknownCommandResponse: false
});

exports.shard = new Discord.ShardClientUtil(client);

client.registry
// Registers your custom command groups
	.registerGroups([
	['colour', 'Colour'],
])

// Registers all built-in groups, commands, and argument types
	.registerDefaults()

// Registers all of your commands in the ./commands/ directory
	.registerCommandsIn(path.join(__dirname, 'commands'));

client.on('ready', () => {
	console.log(`\nLogged in:
Bot: ${client.user.tag} / ${client.user.id} / v${version} (Codename ${description})
Shard: ${this.shard.id} (${this.shard.count} shards)
`);

	client.user.setGame("Discord.JS Recode")

	/*client.user.setUsername('jColour Alpha');
  client.user.setAvatar('./avatar.png')*/

	// Sorry I wanted to update bot info, left it there  ^

});

client.setProvider(
	sqlite.open(path.join(__dirname, 'settings.sqlite3')).then(db => new Commando.SQLiteProvider(db))
).catch(console.error);


client.login(config.token);

/*

WEB SERVER PART

*/

// server.js

// set up ======================================================================
// get all the tools we need
const express = require('express');
const app = express();
const port = process.env.PORT || config.port;
const helmet = require('helmet');

const middleware = [
	helmet(),
	express.static('public')
]

app.set('view engine', 'ejs'); // set up ejs for templating
app.use(middleware);

// routes ======================================================================


// show the home page (will also have our login links)
app.get('/', function(req, res) {
	res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=268454912`)
});

app.get('/:id', function(req, res) {
	res.render('index.ejs', {
		server: client.guilds.find("id", req.params.id)
	});
});


// =============================================================================
// ERROR PAGES =================================================================
// =============================================================================

// Handle 404
app.use(function(req, res) {
	res.status(404).render('error.ejs', {
		errorNum: 404,
		errorMsg: "File not found."
	})
});

// launch ======================================================================
app.listen(port);
console.log('Listening to requests on port ' + port);
