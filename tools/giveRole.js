const getColors = require('get-image-colors')
const chroma = require("chroma-js")

const config = require('./../config/config.json');

const DBL = require("dblapi.js");
const dbl = new DBL(config.dblToken);

async function giveRole(msg, chosenRole) {
    const rolesToRemove = msg.guild.roles.array().filter(role => role.name.startsWith("colour "));

    let failed; // Prepare for spaghoot code

    // Updating the roles
    await msg.member.removeRoles(rolesToRemove, `jColour: Colour update (=> ${chosenRole.name})`).catch(function () {
        msg.say("I am missing permissions. My role should be the highest in the server's role list.");
        failed = true;
    });
    if (!failed) { // Spaghetti intensifies
        await msg.member.addRole(chosenRole).catch(function () {
            msg.say("I am missing permissions. My role should be the highest in the server's role list.");
            failed = true;
        });

        // Notify about role updates
        if (!failed) { // Oh god why would you put that there
            await msg.say("The " + chosenRole.name + " has been added.")
        }
    }
}

async function giveRandomRole(msg, prefix) { // FUNCTION THAT GIVES A RANDOM ROLE
    const colourRoles = msg.guild.roles.array().filter(role => role.name.startsWith("colour "));

    const chosenRole = colourRoles[Math.floor(Math.random() * colourRoles.length)];
    if (chosenRole) {
        await giveRole(msg, chosenRole);
    } else {
        msg.say(`There are no roles setup! Please check out ${prefix}tutorial`)
    }

}

async function giveSuitableRole(msg, prefix) {
    getColors(msg.author.displayAvatarURL, function (err, colors) {
        if (err) throw err
        const color = colors[0];

        let smallestDistance = {
            id: null,
            distance: 999999
        }

        const colourRoles = msg.guild.roles.array().filter(role => role.name.startsWith("colour "));

        colourRoles.forEach(function (element) {
                const distance = chroma.distance(element.hexColor, color, "rgb");
                // RGB distance between colours

                if (distance < smallestDistance.distance) { // Replaces if smaller
                    smallestDistance = {
                        id: element.id,
                        distance: distance
                    }
                }

        });

        const chosenRole = msg.guild.roles.find("id", smallestDistance.id);
        if (chosenRole) {
            giveRole(msg, chosenRole);
        } else {
            msg.say(`There are no roles setup! Please check out ${prefix}tutorial`)
        }

    })
};

async function checkDbl(msg) {
    if (config.dblToken) {
        dbl.hasVoted(msg.author.id, 14).then(function (result) {
            if (!result) { // if user hasnt voted and dbl is enabled
                return false
            } else {
                return true
            }
        });
    } else {
        return true
    }
}
module.exports.giveRole = giveRole;
module.exports.giveRandomRole = giveRandomRole;
module.exports.giveSuitableRole = giveSuitableRole;
module.exports.checkDbl = checkDbl;