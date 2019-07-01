const {Command} = require('discord.js-commando');
const sqlite = require('sqlite');
const Discord = require("discord.js")

module.exports = class ChannelCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'delrole',
      group: 'role',
      memberName: 'delrole',
      description: 'Removes an opt-in role from the server!',
      examples: ["delRole anime"],
      guildOnly: true,
      throttling: {
          usages: 2,
          duration: 10
      },
      aliases: [
        "delroles",
        "del-role",
        "del-roles",
        "deleterole",
        "deleteroles",
        "delete-role",
        "delete-roles",
        "remrole",
        "remroles",
        "rem-role",
        "rem-roles",
        "removerole",
        "removeroles",
        "remove-role",
        "remove-roles"
      ],
      args: [
        {
          key: 'role',
          label: 'role',
          prompt: "What role should we remove from the opt-in roles?",
          type: 'role',
        }
      ]
    });
  }

  hasPermission(msg) {
    return msg.member.hasPermission('MANAGE_ROLES') || this.client.isOwner(msg.author);
  }

  async run(msg, args) {

    const roleIds = msg.guild.settings.get("optInRoles", []);
    const newRoleIds = [];
    roleIds.forEach(function(roleId) {
      if (roleId !== args.role.id) {
        newRoleIds.push(roleId);
      }
    })
    msg.guild.settings.set("optInRoles", newRoleIds);

    const embed = new Discord.RichEmbed();
    embed.setColor("RED");
    embed.setTitle("Removed the role " + args.role.name + ".");
    embed.setDescription("The role still exists - remember to delete it from your server settings!")
    msg.channel.send(embed);


  }
};
