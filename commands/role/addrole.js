const {Command} = require('discord.js-commando');
const sqlite = require('sqlite');
const Discord = require("discord.js");

module.exports = class ChannelCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'addrole',
      group: 'role',
      memberName: 'addrole',
      description: 'Adds an opt-in role to the server!',
      examples: ["addrole anime"],
      guildOnly: true,
      throttling: {
          usages: 2,
          duration: 10
      },
      aliases: [
        "add-role",
        "addroles",
        "add-roles",
        "roleadd",
        "rolesadd",
        "role-add",
        "roles-add"
      ],
      args: [
        {
          key: 'role',
          label: 'role',
          prompt: "What role should we add to the list of opt-in roles?",
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
    if (!roleIds.includes(args.role.id)) {
      roleIds.push(args.role.id);
    }
    msg.guild.settings.set("optInRoles", roleIds);

    const embed = new Discord.RichEmbed();
    embed.setColor("GREEN");
    embed.setTitle("Added the role " + args.role.name + ".");
    embed.setDescription("Users can now access the role with the " + msg.guild.commandPrefix + "roles command!");
    msg.channel.send(embed);


  }
};
