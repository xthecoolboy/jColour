const {
  Command
} = require('discord.js-commando');
const {
  stripIndents
} = require('common-tags');

const {
  version,
  description
} = require('./../../package.json');
const {
  formatMs
} = require("./../../tools/formatms.js");

const os = require('os');
const Discord = require('discord.js');

module.exports = class ChannelCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'stats',
      group: 'info',
      memberName: 'stats',
      description: 'Fetches info related to the bot',
      examples: ["stats", "stats adding arguments is useless"],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 10
      },
      aliases: [
        "info"
      ]
    });
  }

  async run(msg, args) {

    // Making shortcuts for ease of use
    const client = this.client;
    const me = client.user;

    let embed = new Discord.RichEmbed()

      // Sets basic info for the embed
      .setTitle(`${me.username} Stats`)
      .setThumbnail(me.avatarURL)

      // Nice friendly blue
      .setColor("BLUE")

      // Formats uptime from ms to a cool format, utils/tools/formatms.js
      .setDescription(`**Uptime**: ${formatMs(client.uptime)}`)

      // Let's start adding some fields.

      .addField(
        "Specs",
        stripIndents `
        **CPU**: ${os.cpus().length}x ${(os.cpus()[0]["speed"] / 1000).toFixed(2)}GHz
        **RAM**: ${(os.totalmem() / (1024 ** 3)).toFixed(1)}gb`,
        true
      )

      .addField(
        "Versions",
        stripIndents `
        **Bot**: v${version} (${description})
        **NodeJS**: ${process.version}`,
        true
      )

    embed.setFooter("Owner: " + client.owners[0].tag)

    if (client.shard.count === 1) { // if theres only one shard it doesnt spam useless info
      embed.addField(
        "Size",
        stripIndents `
          **Shards**: ${client.shard.count}
          **Guilds**: ${client.guilds.size}
          **Channels**: ${client.channels.size}
          **Users**: ${client.users.size}`,
        true
      )
      msg.embed(embed)
    } else { // if there are multiple shards, you get info for both the current shard and all shards together
      embed.addField(
        "This Shard",
        stripIndents `
          **Shard ID**: ${client.shard.id}
          **Guilds**: ${client.guilds.size}
          **Channels**: ${client.channels.size}
          **Users**: ${client.users.size}`,
        true
      );

      getShardValues()
        .then(results => {
          embed.addField(
            "All Shards",
            stripIndents `
              **Shards**: ${client.shard.count}
              **Guilds**: ${results[0]}
              **Channels**: ${results[1]}
              **Users**: ${results[2]}`,
            true
          )
          msg.embed(embed)
        })


      function getShardValues(callback) { // this part sucks and i dont understand it
        return new Promise(function(fulfill, reject) {
          client.shard.fetchClientValues('guilds.size')
            .then(count => {
              let totalGuilds = count.reduce((prev, val) => prev + val, 0)
              client.shard.fetchClientValues('channels.size')
                .then(count => {
                  let totalChannels = count.reduce((prev, val) => prev + val, 0)
                  client.shard.fetchClientValues('users.size')
                    .then(count => {
                      let totalUsers = count.reduce((prev, val) => prev + val, 0)
                      fulfill([totalGuilds, totalChannels, totalUsers]);
                    })
                })
            })
        })
      }


    }
  }
};
