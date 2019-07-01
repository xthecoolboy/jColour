const {Command} = require('discord.js-commando');
const Discord = require('discord.js');

module.exports = class ChannelCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'logs',
      group: 'jlogs',
      memberName: 'logs',
      description: 'Gets info about join logs - USE THIS COMMAND FIRST!',
      examples: ["logs", "logs you dont need arguments here"],
      guildOnly: true,
      throttling: {
          usages: 2,
          duration: 10
      },
      aliases: [
        "join-logs",
        "log",
        "jlogs",
        "join-log",
        "joinlogs"
      ]
    });
  }

  hasPermission(msg) {
    return msg.member.hasPermission('MANAGE_CHANNELS') || this.client.isOwner(msg.author);
  }

  async run(msg, args) {

    // Let's start by fetching all the info from our database.

    let channel = msg.guild.settings.get("joinLogsChannel");
    if (channel) {
      channel = msg.guild.channels.find("id", channel);
      if (!channel) {
        return msg.send(`Please run the ${msg.guild.commandPrefix}remove-logs command.`);
      }
    };

    let autoRole = msg.guild.settings.get("joinLogsAutoRole");
    if (!autoRole) {
      autoRole = `Not set`
    } else {
      autoRole = msg.guild.roles.find("id", autoRole).name;
    };

    let botRole = msg.guild.settings.get("joinLogsBotRole");
    if (!botRole) {
      botRole = `Not set`
    } else {
      botRole = msg.guild.roles.find("id", botRole).name;
    };

    let verification = msg.guild.settings.get("joinLogsVerification");
    if (verification) {
      verification = "Yes";
    } else {
      verification = "No";
    };

    let verificationLogs = msg.guild.channels.find("id", msg.guild.settings.get("joinLogsVerificationLogs", null));
    if (!verificationLogs) {
      verificationLogs = "Not set";
    } else {
      verificationLogs = `${verificationLogs.name} / <#${verificationLogs.id}>`;
    };





    // Let's start building an embed!
    const embed = new Discord.RichEmbed();
    embed.setFooter(`Please check ${msg.guild.commandPrefix}logs-help for a full tutorial.`);

    if (channel) { // There is a channel set

      //Sets basic info for the embed
      embed.setTitle("Join Logs");
      embed.setDescription("Join Logs are enabled.");

      // Nice friendly blue
      embed.setColor("BLUE");

      // Let's start adding some fields.

      embed.addField(
        "Channel",
        `${channel.name} / <#${channel.id}>`,
        true
      );

      embed.addField(
        "Auto Role",
        autoRole,
        true
      );

      embed.addField(
        "Bot Auto Role",
        botRole,
        true
      );

      embed.addField(
        "Extra Verification",
        verification,
        true
      );

      embed.addField(
        "Extra Verification Logs",
        verificationLogs,
        true
      );

    } else { // Join logs aren't enabled.

      //Sets basic info for the embed
      embed.setTitle("Join Logs aren't enabled!");
      embed.setDescription(`You need to set a channel with the ${msg.guild.commandPrefix}set-logs-channel command.`);

      // Not-so-nice not-so-friendly red
      embed.setColor("RED");

    }

    // Finally sends the message
    msg.embed(embed);


  }
};
