

/* 

LAUNCHING SHARDS
this is a mess dont use it, it doesnt work

*/

const Discord = require('discord.js');

const Manager = new Discord.ShardingManager('./app.js', {
	totalShards: 2
});

Manager.spawn()