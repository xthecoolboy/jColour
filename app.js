const Discord = require('discord.js');
const Commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path = require('path');
const chroma = require('chroma-js')
const {
  version,
  description
} = require('./package.json');
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
const config = require('./config/config.json')[nodeEnv()];

// Init client
const client = new Commando.Client({
  owner: config.ownerid,
  commandPrefix: config.prefix,
  disableEveryone: true,
  unknownCommandResponse: false
});

const DiscordBotList = require("dblapi.js");
if (config.dblToken) {
  const DBL = new DiscordBotList(config.dblToken, client);
  DBL.on('posted', () => {
    console.log("Discordbots stats posted!")
  })
}

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
});

client.getUserAndGuildData = function(id, guildid) {
  const user = client.users.find("id", id);
  const guild = client.guilds.find("id", guildid);
  if (user && guild) {
    const member = guild.members.get(id)
    if (member) {
      const coloursRole = guild.settings.get('color-role');
      const hexColoursRole = guild.settings.get('hexColor');
      const perms = member ? member.hasPermission("MANAGE_ROLES") : false;
      return {
        "user": {
          "manageRoles": perms,
          "avatar": user.displayAvatarURL,
          "name": user.username,
          "tag": user.tag,
          "canUseColours": coloursRole ? member.roles.exists('id', coloursRole) : true,
          "canUseHex": hexColoursRole ? member.roles.exists("id", hexColoursRole) : false,
          "theme": client.settings.get("dark-theme-" + user.id, false)
        },
        "guilds": client.getAllServers()
      }
    } else {
      return client.getUserData(id)
    }

  } else {
    return client.getUserData(id)
  }
}

client.getUserData = function(id) {
  const user = client.users.find("id", id);
  if (user) {
    return {
      "user": {
        "avatar": user.displayAvatarURL,
        "name": user.username,
        "tag": user.tag,
        "theme": client.settings.get("dark-theme-" + user.id, false),
      },
      "guilds": client.getAllServers()
    }
  } else {
    return {
      "user": false,
      "guilds": client.getAllServers()
    }
  }
}

client.getCommandData = function() { // we need to get command data this way too
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

client.getAllServers = function() {
  const json = []
  client.guilds.forEach(function(guild) {
    const colourRoles = guild.roles.array().filter( // only colour roles
      role =>
      role.name.toLowerCase().startsWith("colour ") &&
      !(role.name.toLowerCase().startsWith("colour u-"))
    )

    const roles = colourRoles.map(role => // push each role into array
      ({
        "name": role.name,
        "colour": role.hexColor,
        "id": role.id
      })
    ).sort(function(a, b) {
      return chroma(a.colour).get("hcl")[0] - chroma(b.colour).get("hcl")[0];
    });

    const normalRoles = guild.roles.array().filter(
      role => !role.name.toLowerCase().startsWith("colour ") && !role.managed
    ).sort(function(a, b) {
      return (a.position > b.position) ? 1 : ((b.position > a.position) ? -1 : 0);
    });

    const formattedNormalRoles = normalRoles.map(role => // push each role into array
      ({
        "name": role.name,
        "colour": role.hexColor,
        "id": role.id
      })
    )

    json.push({
      "hexRole": guild.settings.get('hexColor'),
      "name": guild.name,
      "id": guild.id,
      "iconurl": guild.iconURL ? guild.iconURL : "https://discordapp.com/assets/81d74b2ebb053fbccee41865a47d48c3.svg",
      "roles": roles,
      "normalRoles": formattedNormalRoles,
      "restrictRole": guild.settings.get('color-role')
    })

  })
  return json;
}

client.updateTheme = function(id) {
  const darkTheme = client.settings.get("dark-theme-" + id, false)
  if (darkTheme) {
    client.settings.remove("dark-theme-" + id)
  } else {
    client.settings.set("dark-theme-" + id, true)
  }
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
