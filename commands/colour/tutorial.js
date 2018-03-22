const {Command} = require('discord.js-commando');
const config = require('./../../config/config.json');

module.exports = class ChannelCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'tutorial',
			group: 'colour',
			memberName: 'tutorial',
			description: 'Gives you the necessary info for using the bot.',
			examples: ["tutorial"],
			guildOnly: false,
			throttling: {
				usages: 2,
				duration: 10
			},
			aliases: [
				"info",
				"tut",
				"how",
				"howto",
				"instructions",
				"information"
			]
		});
	}

	async run(msg, args) {

		msg.say(`**__TUTORIAL__**
~~━━━━━━━━━━━━━━━━━━━━━━━━━━━━━~~

**Setup**
**1.** Make sure my role (jColour) has permissions to change roles and is the highest role in the role list.
**2.** Make a role called \`colour <something>\` and give it a colour.
**3.** Repeat step 2. 
**4.** Check that everything is working by typing \`j!colours\`

**Protip:** If you name a role \`colour default\`, all new members get it on join.

~~━━━━━━━━━━━━━━━━━━━━━━━━━━━━━~~

**Getting a colour**
**1.** Type \`j!colours\` to see the full list of colours. 
**2.** Type \`j!colours <any colour from the list\`.
**3.** Profit.

If you don't get the colours even though the bot told you so, the permissions are setup incorrectly.
Please refer to part 1 in Setup.

~~━━━━━━━━━━━━━━━━━━━━━━━━━━━━━~~

**Note**: We don't save any user data unless you ex. change a prefix. 
All webpages are served dynamically and no data is left behind.`)



	}
};
