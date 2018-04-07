const {
	Command
} = require('discord.js-commando');
const config = require('./../../config/config.json');

module.exports = class ChannelCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'tutorial',
			group: 'info',
			memberName: 'tutorial',
			description: 'Gives you the necessary info for using the bot.',
			examples: ["tutorial"],
			guildOnly: false,
			throttling: {
				usages: 2,
				duration: 10
			},
			aliases: [
				"tut",
				"how",
				"howto",
				"instructions",
				"information"
			]
		});
	}

	async run(msg, args) {

		let prefix = this.client.commandPrefix;
		if (msg.guild) {
			prefix = msg.guild.commandPrefix;
		}

		const tutorialMsg = `**__TUTORIAL__**
~~━━━━━━━━━━━━━━━━━━━━━━━━━━━━━~~

**Setup**
**1.** Make sure my role (jColour) has permissions to change roles and is the highest role in the role list.
**2.** Make a role called \`colour <something>\` and give it a colour.
**3.** Repeat step 2. 
**4.** Check that everything is working by typing \`${prefix}colour\`

**Protip:** If you name a role \`colour default\`, all new members get it on join.
If you want to allow members (everyone or one role) to get custom hex colour roles, check out \`${prefix}colour hex\`.
You can restrict everything to a single role with \`${prefix}set-role\`.

~~━━━━━━━━━━━━━━━━━━━━━━━━━━━━━~~

**Getting a colour**
**1.** Type \`${prefix}colour\` to see the full list of colours. 
**2.** Type \`${prefix}colour <any colour from the list\`.
**3.** Profit.

**Protip:** With the command \`${prefix}colour random\` you can get a random colour from the list.
\`${prefix}colour pick\` matches all available colours to your avatar and picks the best one.

~~━━━━━━━━━━━━━━━━━━━━━━━━━━━━━~~

**Note**: We don't save any user data unless you ex. change a prefix or vote for the bot. 
All webpages are served dynamically and no data is left behind.

~~━━━━━━━━━━━━━━━━━━━━━━━━━━━━━~~

Here's a Youtube tutorial for the setup: <https://jcolour.jaqreven.com/video>
If you need further help, please join our support server at ${config.support}`;

		msg.say(tutorialMsg)



	}
};