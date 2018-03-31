const {Command} = require('discord.js-commando');
const {stripIndents} = require('common-tags');

const {version, description} = require('./../../package.json');
const {formatMs} = require("./../../tools/formatms.js");

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
        stripIndents`
        **CPU**: ${os.cpus().length}x ${(os.cpus()[0]["speed"] / 1000).toFixed(2)}GHz
        **RAM**: ${(os.totalmem() / (1024 ** 3)).toFixed(1)}gb`,
        true
      )

      .addField(
        "Versions",
        stripIndents`
        **Bot**: v${version} (${description})
        **NodeJS**: ${process.version}`,
        true
      )

      .addField(
        "Size",
        stripIndents`
        **Guilds**: ${client.guilds.size}
        **Channels**: ${client.channels.size}`,
        true
      )

      .addField(
        "Owner",
        this.client.owners[0].tag,
        true
      )

    msg.embed(embed)
  }
};
