const { stripIndents, oneLine } = require('common-tags');
const {Command, util} = require('discord.js-commando');

module.exports = class HelpCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'help',
			group: 'info',
			memberName: 'help',
			aliases: ['commands'],
			description: 'Displays a list of available commands, or detailed information for a specified command.',
			details: oneLine`
				The command may be part of a command name or a whole command name.
				If it isn't specified, all available commands will be listed.
			`,
			examples: ['help', 'help prefix'],
			guarded: true,

			/* args: [
				{
					key: 'command',
					prompt: 'Which command would you like to view the help for?',
					type: 'string',
					default: ''
				}
			] */
		});
	}

	async run(msg, args) { // eslint-disable-line complexity
		const groups = this.client.registry.groups;
		const commands = this.client.registry.findCommands(args.command, false, msg);
		const showAll = false;
		/* if(args.command && !showAll) {
			if(commands.length === 1) {
				let help = stripIndents`
					${oneLine`
						__Command **${commands[0].name}**:__ ${commands[0].description}
						${commands[0].guildOnly ? ' (Usable only in servers)' : ''}
						${commands[0].nsfw ? ' (NSFW)' : ''}
					`}

					**Format:** ${msg.anyUsage(`${commands[0].name}${commands[0].format ? ` ${commands[0].format}` : ''}`)}
				`;
				if(commands[0].aliases.length > 0) help += `\n**Aliases:** ${commands[0].aliases.join(', ')}`;
				help += `\n${oneLine`
					**Group:** ${commands[0].group.name}
					(\`${commands[0].groupID}:${commands[0].memberName}\`)
				`}`;
				if(commands[0].details) help += `\n**Details:** ${commands[0].details}`;
				if(commands[0].examples) help += `\n**Examples:**\n${commands[0].examples.join('\n')}`;

				const messages = [];
				try {
					messages.push(await msg.say(help));
					if(msg.channel.type !== 'dm') messages.push(await msg.say('Sent you a DM with information.'));
				} catch(err) {
					messages.push(await msg.say('Unable to send you the help DM. You probably have DMs disabled.'));
				}
				return messages;
			} else if(commands.length > 15) {
				return msg.say('Multiple commands found. Please be more specific.');
			} else if(commands.length > 1) {
				return msg.say(util.disambiguation(commands, 'commands'));
			} else {
				return msg.say(
					`Unable to identify command. Use ${msg.usage(
						null, msg.channel.type === 'dm' ? null : undefined, msg.channel.type === 'dm' ? null : undefined
					)} to view the list of all commands.`
				);
			}
		} else { */
			const messages = [];
			try {
				messages.push(await msg.say(stripIndents`

                **Available Commands**

                ~~━━━━━━━━━━━━~~

					${(showAll ? groups : groups.filter(grp => grp.commands.some(cmd => cmd.name !== "eval")))
						.map(grp => stripIndents`
                            __${grp.name}__
                            
							${(showAll ? grp.commands : grp.commands.filter(cmd => cmd.name !== "eval"))
								.map(cmd => `**${msg.guild ? msg.guild.commandPrefix : null}${cmd.name}${cmd.format ? " " + cmd.format : ""}**: ${cmd.description}${cmd.nsfw ? ' (NSFW)' : ''}`).join('\n')
							}
                        
                            ~~━━━━━━━━━━━━~~
                            `).join('\n\n')
                    }

					View the documentation: https://jcolour.jaqreven.com/docs
					`, { split: true }));
				// if(msg.channel.type !== 'dm') messages.push(await msg.say('Sent you a DM with information.'));
			} catch(err) {
				messages.push(await msg.say('Unable to send the message.'));
			}
			return messages
		}
	// }
};
