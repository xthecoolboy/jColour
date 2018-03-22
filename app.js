const Discord = require('discord.js');
const Commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path = require('path');
const {version, description} = require('./package.json');
const config = require('./config/config.json');

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
])

// Registers all built-in groups, commands, and argument types
	.registerDefaults()

// Registers all of your commands in the ./commands/ directory
	.registerCommandsIn(path.join(__dirname, 'commands'));

client.on('ready', () => {
	console.log(`\nLogged in:
Bot: ${client.user.tag} / ${client.user.id} / v${version} (Codename ${description})
`);

	client.user.setGame("j!colours " + version)

	/*client.user.setUsername('jColour Alpha');
  client.user.setAvatar('./avatar.png')*/

	// Sorry I wanted to update bot info, left it there  ^

});

client.setProvider( // Sqlite database for prefixes and such
	sqlite.open(path.join(__dirname, 'settings.sqlite3')).then(db => new Commando.SQLiteProvider(db))
).catch(console.error);


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

const middleware = [
	helmet(),
	morgan('dev'), // Logs request data to console
	express.static('public') // public dir can be accessed
]

app.set('view engine', 'ejs'); // ejs for server side js templating
app.use(middleware);

// routes ======================================================================


// redirect to bot inv
app.get('/', function(req, res) {
	res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=268454912`)
});

// colour page: sends server as a var
app.get('/:id', function(req, res) {
	res.render('index.ejs', {
		server: client.guilds.find("id", req.params.id)
	});
});

// 404 (shouldn't happen!)
app.use(function(req, res) {
	res.status(404).render('error.ejs', {
		errorNum: 404,
		errorMsg: "File not found."
	})
});

// starts listening to requests
app.listen(port);
console.log('Listening to requests on port ' + port);
