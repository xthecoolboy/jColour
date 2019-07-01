const Discord = require('discord.js');
const Commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path = require('path');
const chroma = require('chroma-js')
const {
  version,
  description
} = require('./package.json');
const nodeEnv = function () {
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
const {
  calcTime
} = require("./tools/calctime.js");

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
    ['info', 'Information'],
    ['jlogs', 'Join Logs'],
    ['role', 'Opt-In Roles']
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

/*
 *
 * join logs, check commands/jlogs
 *
 */

client.on('guildMemberAdd', member => {

  //Let's gather some data.

  const targetChannel = member.guild.channels.find("id", member.guild.settings.get("joinLogsChannel", null));
  const autoRole = member.guild.roles.find("id", member.guild.settings.get("joinLogsAutoRole", null));
  const autoBotRole = member.guild.roles.find("id", member.guild.settings.get("joinLogsBotRole", null));

  if (targetChannel) { // If join logs is enabled (a channel is set)

    // Let's get some messages for it lol
    const titles = [
      `${member.user.username} popped up!`,
      `${member.user.username} joined in the fun!`,
      `${member.user.username} joined.`,
      `${member.user.username} clicked the invite!`,
      `${member.user.username} is now a member. It's time for the ritual.`,
      `It's a bird! It's a plane! It's ${member.user.username}!`,
      `${member.user.username} IS HERE (・∀・)ノ`
    ];

    // Chooses a random title
    title = titles[Math.floor(Math.random() * titles.length)];

    const embed = new Discord.RichEmbed()
      // Sets base info for the embed
      .setTitle(title)
      .setThumbnail(member.user.avatarURL)
      .setColor("GREEN")
      .setFooter(new Date())

      // Adds fields with info related to the member
      .addField("User", `${member.user.tag} (${member.user})`)
      .addField("ID", member.user.id)
      .addField("Account Made", `${calcTime(new Date(), member.user.createdAt)} ago`)
      .addField("Member Count", member.guild.memberCount)

    targetChannel.send({
      embed
    });

    if (member.user.bot && autoBotRole) { // If member is a bot AND auto bot role exists
      member.addRole(autoBotRole, "Join Logs (Auto Bot Role)");
    } else if (!member.user.bot && autoRole) { // If member is not a bot and auto role exists
      member.addRole(autoRole, "Join Logs (Auto Role)");
    }
  }
});

client.on('guildMemberRemove', member => {

  const targetChannel = member.guild.channels.find("id", member.guild.settings.get("joinLogsChannel"));

  if (targetChannel) {

    const titles = [
      `${member.user.username} left the building.`, `Bye ${member.user.username}!`,
      `See you later, ${member.user.username}.`, `${member.user.username} has disappeared.`,
      `It's sad to see you go, ${member.user.username}. :(`, `${member.user.username}, hope you enjoyed your stay!`
    ];
    title = titles[Math.floor(Math.random() * titles.length)];

    const embed = new Discord.RichEmbed()
      .setTitle(title)
      .setThumbnail(member.user.avatarURL)
      .setColor("RED")
      .setFooter(new Date())

      .addField("User", `${member.user.tag} (${member.user})`)
      .addField("ID", member.user.id)
      .addField("Account Made", `${calcTime(new Date(), member.user.createdAt)} ago`)
      .addField(`Joined ${member.guild.name}`, `${calcTime(new Date(), member.joinedAt)} ago`)
      .addField("Member Count", member.guild.memberCount)

    targetChannel.send({
      embed
    });
  }
});


/*
 *
 * main process queries 
 *
 */

client.getUserAndGuildData = function (id, guildid) {
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

client.getUserData = function (id) {
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

client.getAllServers = function () {
  const json = []
  client.guilds.forEach(function (guild) {
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
    ).sort(function (a, b) {
      return chroma(a.colour).get("hcl")[0] - chroma(b.colour).get("hcl")[0];
    });

    const normalRoles = guild.roles.array().filter(
      role => !role.name.toLowerCase().startsWith("colour ") && !role.managed
    ).sort(function (a, b) {
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

client.updateTheme = function (id) {
  console.log(client.settings)
  const darkTheme = client.settings.get(`dark-theme-${id}`, false)
  if (darkTheme) {
    client.settings.remove(`dark-theme-${id}`)
  } else {
    client.settings.set(`dark-theme-${id}`, true)
  }
}

client.createColour = async function (server, name, colour) {
  const guild = client.guilds.get(server)
  if (guild) {
    return await guild.createRole({
      permissions: 0,
      name: `colour ${name}`,
      color: colour
    })
  } else {
    return false
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