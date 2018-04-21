const config = require('./config/config.json');

const DBL = require("dblapi.js");
const dbl = new DBL(config.dblToken, {
	webhookPort: 5000,
	webhookAuth: config.dblWebAuth
});

/* 

LAUNCHING SHARDS
this is a mess dont use it, it doesnt work

*/

const Discord = require('discord.js');

const Manager = new Discord.ShardingManager('./app.js', {
	totalShards: 2
});

Manager.spawn()

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
	helmet({
		frameguard: false
	}),
	morgan('tiny'), // Logs request data to console
	express.static('public') // public dir can be accessed
]

app.set('view engine', 'ejs'); // ejs for server side js templating
app.use(middleware);

// routes ======================================================================


// redirect to bot inv
app.get('/invite', function (req, res) {
	Manager.fetchClientValues("user.id").then(
		function (value) {
			res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${value[0]}&scope=bot&permissions=268454912`)
		}
	)
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
	Manager.broadcastEval("this.getCommandData()").then(
		function (value) {
			res.render('index.ejs', {
				registry: value[0]
			})
		}
	)
});

// colour page: sends server as a var
app.get('/:id', function (req, res) {
	Manager.broadcastEval("this.getGuildData('" + req.params.id + "')").then(
		function (value) {
			res.render('colour.ejs', {
				servers: value,
				tinycolor: tinycolor,
			})
		}
	)
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

		const string = `this.handleWebhook('${vote["type"]}', '${vote["bot"]}', '${vote["user"]}')`;
		Manager.broadcastEval(string);

	});

}