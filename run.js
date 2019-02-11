// Run this file instead of bot.js, allows support for sharding and launches the web server

const Discord = require('discord.js');
const config = require('./config/config.json');

const Manager = new Discord.ShardingManager('./app.js');
Manager.spawn(config.shards);

/*
 *
 * WEB SERVER PART
 *
 */

// Things we need for the web server
const express = require('express');
const app = express();
const port = config.port;
const helmet = require('helmet');
const morgan = require("morgan");

const chroma = require("chroma-js");
const getColors = require('get-image-colors')

var session = require('express-session');
var passport = require('passport');
var Strategy = require('passport-discord').Strategy

const bodyParser = require("body-parser")

const middleware = [
  helmet({
    frameguard: false
  }),
  morgan('tiny'), // Logs request data to console
  express.static('public'), // public dir can be accessed
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
  }),
  passport.initialize(),
  passport.session(),
  bodyParser.urlencoded({
    extended: true
  }),
  bodyParser.json()
]

app.set('view engine', 'ejs'); // ejs for server side js templating
app.use(middleware);

app.use("/docs", express.static('docs/_build/html'))

passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var scopes = ['identify', 'guilds'];

passport.use(new Strategy({
  clientID: config.id,
  clientSecret: config.secret,
  callbackURL: config.callback,
  scope: scopes
}, function(accessToken, refreshToken, profile, done) {
  process.nextTick(function() {
    return done(null, profile);
  });
}));

/*
 * Routes
 */

app.get('/auth', passport.authenticate('discord', {
  scope: scopes
}), function(req, res) {});

app.get('/callback',
  passport.authenticate('discord', {
    failureRedirect: '/'
  }),
  function(req, res) {
    res.redirect('/')
  } // auth success
);

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

// redirect to bot inv
app.get('/invite', function(req, res) {
  Manager.fetchClientValues("user.id").then(
    function(value) {
      res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${value[0]}&scope=bot&permissions=268454912`)
    }
  )
});

app.get('/support', function(req, res) { // Support guild
  res.redirect(config.support)
});

app.post("/toggleTheme", function (req, res) {
	if (req.isAuthenticated()) {
		Manager.broadcastEval("this.updateTheme('" + req.user.id + "')")
    res.status(200).json({
      status: 200,
      message: "OK"
    })
	} else {
		return res.status(403).json({
			status: 403,
			message: "Not authenticated!"
		})
	}
})

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
            userBackup: req.user,
						id: config.demoId,
						auth: req.isAuthenticated(),
						server: server,
						page: "demo"

					})
				}
			)
		}
	)
})

app.get('/:id', /* checkAuth,*/ function(req, res) {
  if (req.isAuthenticated()) {
    Manager.broadcastEval(`this.getUserAndGuildData('${req.user.id}', '${req.params.id}')`).then(
      function(datas) {
        let user = datas.find(function(element) {
          return typeof element.manageRoles !== 'undefined';
        })
        if (!user) {
          user = datas.find(function(element) {
            return element
          })
        }
        Manager.broadcastEval("this.getAllServers({})").then(
          function(value) {
            const merged = [].concat.apply([], value);
            const reqServers = [];
            req.user["guilds"].forEach(function(element) {
              reqServers.push(element.id);
            })
            const shared = merged.filter(guild => reqServers.includes(guild.id));
            const server = shared.filter(guild => guild.id === req.params.id)[0]
            if (server) {
              res.render('dashboard.ejs', {
                commonServers: shared,
                chroma: chroma,
                user: user,
                id: req.params.id,
                auth: req.isAuthenticated(),
                server: server,
                page: "colour"
              })
            } else {
              res.redirect("/")
            }
          }
        )
      }
    )
  } else {
    if (req.params.id) {
      res.redirect("/auth")
    }
  }
});

app.get('/', /* checkAuth,*/ function(req, res) {
  if (req.isAuthenticated()) {
    const command = `this.getUserData('${req.user.id}')`;
    Manager.broadcastEval(command).then(
      function(datas) {
        user = datas.find(function(element) {
          return element
        })
        Manager.broadcastEval("this.getAllServers({})").then(
          function(value) {
            const merged = [].concat.apply([], value);
            const reqServers = [];
            req.user["guilds"].forEach(function(element) {
              reqServers.push(element.id);
            })
            const shared = merged.filter(guild => reqServers.includes(guild.id));
            res.render('home.ejs', {
              commonServers: shared,
              user: user,
              userBackup: req.user,
              auth: req.isAuthenticated()
            })
          }
        )
      }
    )
  } else {
    if (req.params.id) {
      res.redirect("/auth")
    } else {
      res.render("home.ejs", {
        commonServers: [],
        user: false,
        userBackup: false,
        auth: req.isAuthenticated(),
      })
    }

  }
});

function checkAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/auth");
}

// 404 (/css, /js etc)
app.use(function(req, res) {
  return res.status(404).render('error.ejs', {
    errorNum: 404,
    errorMsg: "File not found.",
    server: false
  })
});

// Any error
app.use(function(err, req, res, next) {
  return res.status(500).render('error.ejs', {
    errorNum: 500,
    errorMsg: "Internal server error",
    server: false
  });
});

// starts listening to requests
app.listen(port);
console.log('Listening to requests on port ' + port);
