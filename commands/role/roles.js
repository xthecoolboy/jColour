const {
    Command
} = require('discord.js-commando');
const sqlite = require('sqlite');
const Discord = require('discord.js');

module.exports = class ChannelCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'roles',
            group: 'role',
            memberName: 'roles',
            description: 'View the list of available Opt-In roles',
            examples: ["roles", "roles anime"],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 10
            },
            aliases: [
                "role"
            ],
            args: [{
                key: 'role',
                label: 'role',
                prompt: "What role would you like to have?",
                type: 'string',
                default: ''
            }]
        });
    }

    async run(msg, args) {

        const roleIds = msg.guild.settings.get("optInRoles", []);
        let memberRoles = msg.member.roles.filter(function (role) {
            return roleIds.includes(role.id)
        })
        const roles = [];
        const currentRoleIds = [];
        roleIds.forEach(function (roleId) {
            const role = msg.guild.roles.get(roleId);
            if (role) {
                roles.push(role);
                currentRoleIds.push(role.id);
            }
        })
        msg.guild.settings.set("optInRoles", currentRoleIds);

        const roleNames = [];
        let memberRoleNames = [];
        roles.forEach(function (role) {
            roleNames.push(role.name);
        })
        memberRoles.forEach(function (role) {
            memberRoleNames.push(role.name);
        })

        // embed basics
        const embed = new Discord.RichEmbed();
        embed.setTitle("Opt-In Roles");

        /*
         *
         * GIVE/REMOVE A ROLE 
         * 
         */
        if (args.role) {
            const role = roles.find(val => val.name.toLowerCase() === args.role.toLowerCase());
            if (memberRoles.has(role.id)) {
                msg.member.removeRole(role);
                memberRoleNames = memberRoleNames.filter(function (name) {
                    if (role.name == name) {
                        return false;
                    } else {
                        return true;
                    }
                })

                embed.setColor("RED");
                embed.setDescription("Removed the role " + role.name + "!");
            } else {
                msg.member.addRole(role);
                memberRoleNames.push(role.name);

                embed.setColor("GREEN");
                embed.setDescription("Added the role " + role.name + "!");
            }

            embed.addField(
                "Your Roles:",
                memberRoleNames.length === 0 ? "None!" : memberRoleNames.join(", ")
            );

            msg.channel.send(embed);

        /*
         *
         * LIST ROLES 
         * 
         */
        } else {

            embed.setColor("BLUE");
            embed.setDescription(`Use \`${msg.guild.commandPrefix}roles <role>\` to toggle a role!`);

            if (roles.length === 0) {
                embed.setDescription(`There are no available roles - use \`${msg.guild.commandPrefix}addRole\`!`)
            } else {
                embed.addField(
                    "Available Roles:",
                    roleNames.join(", "),
                    true
                );
                embed.addField(
                    "Your Roles:",
                    memberRoleNames.length === 0 ? "None!" : memberRoleNames.join(", ")
                )
            }

            msg.channel.send(embed);

        }
    }
};