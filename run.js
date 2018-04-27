const config = require('./config/config.json');

// Things the Discord bot sharding needs
const Discord = require('discord.js');
const DBL = require("dblapi.js");
const dbl = new DBL(config.dblToken, { // webhook startup
	webhookPort: 5000,
	webhookAuth: config.dblWebAuth
});

// Things we need for the web server
const express = require('express');
const app = express();
const port = process.env.PORT || config.port;
const helmet = require('helmet');
const morgan = require("morgan");
const chroma = require("chroma-js");

var session = require('express-session');
var passport = require('passport');
var Strategy = require('passport-discord').Strategy

/* 

LAUNCHING SHARDS
this should work now

*/

const Manager = new Discord.ShardingManager('./app.js', {
	totalShards: 2
});

Manager.spawn()

/*

WEB SERVER PART

*/

const middleware = [
	/* helmet({
		frameguard: false
	}), */
	morgan('tiny'), // Logs request data to console
	express.static('public'), // public dir can be accessed
	session({
		secret: 'keyboard cat',
		resave: false,
		saveUninitialized: false
	}),
	passport.initialize(),
	passport.session()
]

app.set('view engine', 'ejs'); // ejs for server side js templating
app.use(middleware);

app.use("/docs", express.static('docs/_build/html'))

passport.serializeUser(function (user, done) {
	done(null, user);
});
passport.deserializeUser(function (obj, done) {
	done(null, obj);
});

var scopes = ['identify', 'guilds'];

passport.use(new Strategy({
	clientID: config.id,
	clientSecret: config.secret,
	callbackURL: config.callback,
	scope: scopes
}, function (accessToken, refreshToken, profile, done) {
	process.nextTick(function () {
		return done(null, profile);
	});
}));

// routes ======================================================================



app.get('/auth', passport.authenticate('discord', {
	scope: scopes
}), function (req, res) {});

app.get('/callback',
	passport.authenticate('discord', {
		failureRedirect: '/'
	}),
	function (req, res) {
		res.redirect('/')
	} // auth success
);

app.get('/logout', function (req, res) {
	req.logout();
	res.redirect('/');
});

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

app.get('/video', function (req, res) { // Tutorial video
	res.redirect("https://www.youtube.com/watch?v=AqXlkReI_QU&feature=youtu.be")
});

app.get('/:id/settings', checkAuth, function (req, res) {
	// req.user

	Manager.broadcastEval(`this.getUserAndGuildData('${req.user.id}', '${req.params.id}')`).then(
		function (datas) {
			let user = datas.find(function (element) {
				return typeof element.manageRoles !== 'undefined';
			})
			if (!user) {
				user = datas.find(function (element) {
					return element
				})
			}
			if (user.manageRoles) {
				Manager.broadcastEval("this.getAllServers({allroles: true})").then(
					function (value) {
						const merged = [].concat.apply([], value);
						const reqServers = [];
						req.user["guilds"].forEach(function (element) {
							reqServers.push(element.id);
						})
						const shared = merged.filter(guild => reqServers.includes(guild.id));
						const server = shared.filter(guild => guild.id === req.params.id)[0]
						res.render('settings.ejs', {
							commonServers: shared,
							chroma: chroma,
							user: user,
							id: req.params.id,
							registry: [],
							auth: req.isAuthenticated(),
							server: server,
							page: "settings"
						})
					}
				)
			} else {
				res.status(403).render('error.ejs', {
					errorNum: 403,
					errorMsg: "Unauthorized - you are missing MANAGE_ROLES permissions.",
					server: null
				})
			}
		}
	)

});

app.get("/demo", function (req, res) {
	const command = `this.getUserAndGuildData('${req.user ? req.user.id : ""}', '${config.demoId}')`;
	Manager.broadcastEval(command).then(
		function (datas) {
			let user = datas.find(function (element) {
				return typeof element.manageRoles !== 'undefined';
			})
			if (!user) {
				user = datas.find(function (element) {
					return element
				})
			}
			Manager.broadcastEval("this.getAllServers({})").then(
				function (value) {
					const merged = [].concat.apply([], value);
					const reqServers = [];
					if (req.user) {
						req.user["guilds"].forEach(function (element) {
						reqServers.push(element.id);
						})
					}
					const shared = merged.filter(guild => reqServers.includes(guild.id));
					const server = merged.filter(guild => guild.id === config.demoId)[0]
					res.render('dashboard.ejs', {
						commonServers: shared,
						chroma: chroma,
						user: user,
						id: config.demoId,
						registry: [],
						auth: req.isAuthenticated(),
						server: server,
						page: "demo"
						
					})
				}
			)
		}
	)
})

app.get('/:id?', /* checkAuth,*/ function (req, res) {
	// req.user

	Manager.broadcastEval("this.getCommandData()").then( // gets commands from shards
		function (commands) {

			if (req.isAuthenticated()) {
				const command = req.params.id ? `this.getUserAndGuildData('${req.user.id}', '${req.params.id}')` : `this.getUserData('${req.user.id}')`;
				Manager.broadcastEval(command).then(
					function (datas) {
						let user = datas.find(function (element) {
							return typeof element.manageRoles !== 'undefined';
						})
						if (!user) {
							user = datas.find(function (element) {
								return element
							})
						}
						Manager.broadcastEval("this.getAllServers({})").then(
							function (value) {
								const merged = [].concat.apply([], value);
								const reqServers = [];
								req.user["guilds"].forEach(function (element) {
									reqServers.push(element.id);
								})
								const shared = merged.filter(guild => reqServers.includes(guild.id));
								const server = shared.filter(guild => guild.id === req.params.id)[0]
								res.render('dashboard.ejs', {
									commonServers: shared,
									chroma: chroma,
									user: user,
									id: req.params.id,
									registry: commands[0],
									auth: req.isAuthenticated(),
									server: server,
									page: "colours"
								})
							}
						)
					}
				)
			} else {
				if (req.params.id) {
					res.redirect("/auth")
				} else {
					res.render("dashboard.ejs", {
						commonServers: [],
						chroma: chroma,
						user: {},
						id: req.params.id,
						registry: commands[0],
						auth: req.isAuthenticated(),
						server: false,
						page: "colours"
					})
				}

			}

		}
	)

});





function checkAuth(req, res, next) {
	if (req.isAuthenticated()) return next();
	res.redirect("/auth");
}

// colour page: sends server as a var
/* app.get('/:id', function (req, res) {
	Manager.broadcastEval("this.getGuildData('" + req.params.id + "')").then( // gets roles from shards
		function (value) {
			res.render('colour.ejs', {
				servers: value,
				tinycolor: tinycolor,
			})
		}
	)
}); */

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