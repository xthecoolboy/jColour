const getColors = require('get-image-colors')
const chroma = require("chroma-js")

const config = require('./../config/config.json');

const DBL = require("dblapi.js");
const dbl = new DBL(config.dblToken);

async function giveRole(msg, chosenRole, dontDelete) {
    const rolesToRemove = msg.guild.roles.filter(role => role.name.toLowerCase().startsWith("colour "));
    const userRole = rolesToRemove.find(role => role.name.toLowerCase() === "colour u-" + msg.author.id);
    
    if (chosenRole.name.startsWith("colour u-") && !dontDelete) {
        msg.say("That is a user role, you can't have it.")
    } else {

        if (userRole && !dontDelete) {
            userRole.delete("Role no longer needed")
                .catch(function () {
                    msg.say("I am missing permissions. My role should be the highest in the server's role list.");
                });
        }

        let failed; // Prepare for spaghoot code

        // Updating the roles
        await msg.member.removeRoles(rolesToRemove, `jColour: Colour update (=> ${chosenRole ? chosenRole.name : "Remove roles"})`).catch(function () {
            msg.say("I am missing permissions. My role should be the highest in the server's role list.");
            failed = true;
        });
        if (!failed) { // Spaghetti intensifies
            if (chosenRole) {
                await msg.member.addRole(chosenRole).catch(function () {
                    msg.say("I am missing permissions. My role should be the highest in the server's role list.");
                    failed = true;
                });

                // Notify about role updates
                if (!failed) { // Oh god why would you put that there
                    await msg.say("The " + chosenRole.name + " has been added.")
                }
            } else {
                await msg.say("All colours have been removed!")
            }

        }
    }
}

async function giveRandomRole(msg, prefix, client) { // FUNCTION THAT GIVES A RANDOM ROLE
    const colourRoles = msg.guild.roles.array().filter(
        role => role.name.toLowerCase().startsWith("colour ") && !role.name.toLowerCase().startsWith("colour u-")
    );

    const chosenRole = colourRoles[Math.floor(Math.random() * colourRoles.length)];
    if (chosenRole) {
        await giveRole(msg, chosenRole, false);
    } else {
        msg.say(`There are no roles setup! Please check out ${prefix}tutorial`)
    }

}

async function giveSuitableRole(msg, prefix, client) {
    getColors(msg.author.displayAvatarURL, function (err, colors) {
        if (err) throw err
        const color = colors[0];

        let smallestDistance = {
            id: null,
            distance: 999999
        }

        const colourRoles = msg.guild.roles.array().filter(
            role => role.name.toLowerCase().startsWith("colour ") && !role.name.toLowerCase().startsWith("colour u-")
        );

        colourRoles.forEach(function (element) {
            const distance = chroma.distance(element.hexColor, color, "lab");
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
            giveRole(msg, chosenRole, false);
        } else {
            msg.say(`There are no roles setup! Please check out ${prefix}tutorial`)
        }

    })
};

function checkDbl(msg, client) {
    if (config.dblToken) {
        if (client.isOwner(msg.author)) {
            return true; // User is bot owner
        } else {
            const result = withinLastMonth( // checks if vote was within last 30 days and exists
                client.settings.get(`vote-${msg.author.id}`),
                new Date()
            )
            return result;
        }
    } else {
        return true // no dbl token in config
    }
}

function withinLastMonth(d1, d2, msg) { // https://stackoverflow.com/questions/6154689/how-to-check-if-date-is-within-30-days
    if (d1) {
        var diff = Math.abs(new Date(d1).getTime() - d2.getTime());
        if (diff / (1000 * 60 * 60 * 24) <= 31) {
            return true; // Vote was within the last 30 days
        } else {
            return false; // Vote was over 31 days ago
        }
    } else {
        return false; // Hasn't voted at all or database died somewhere lol
    }

};

function checkHexPerms(msg, client) {
    const isEnabled = msg.guild.settings.get('hexColor') ? true : false;
    const hexColorRoleId = msg.guild.settings.get('hexColor-role');

    if (hexColorRoleId && isEnabled) { // Required role

        const hexColorRole = msg.guild.roles.find("id", hexColorRoleId); // Role object
        if (hexColorRole) { // Role exists

            if (msg.member.roles.has(hexColorRoleId)) { // Role in author roles
                return true;
            } else { // Role not in author roles
                return false;
            }

        } else { // Role somehow disappeared
            return false;
        }

    } else {
        return isEnabled; // No required role
    }

}

async function giveHexRole(msg, client, prefix, colour) {

    if (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(colour)) { // Checks that it indeed is a hex colour

        const colourRoles = msg.guild.roles.filter(role => role.name.toLowerCase().startsWith("colour ")); // all colour roles
        const noUserRoles = colourRoles.filter(role => !role.name.toLowerCase().startsWith("colour u-")); // no colour u-39832958392 roles
        const noUsersRole = colourRoles.filter(role => !(role.name.toLowerCase() === "colour u-" + msg.author.id)); // all roles except users own
        let failed;

        await msg.member.removeRoles( // removes normal (non u-39852395823) ones
            noUsersRole,
            `jColour: Colour update (=> Hex ${colour})`
        ).catch(function () {
            msg.say("I am missing permissions. My role should be the highest in the server's role list.");
            failed = true;
        });

        if (!failed) {
            if (noUserRoles.find("hexColor", chroma(colour).hex())) { // tries to find an exiting role with same color
                const foundRole = noUserRoles.find("hexColor", chroma(colour).hex()) // Converting so ex. #fff and #ffffff work
                await giveRole(msg, foundRole, false);
            } else { // no existing roles found
                const foundRole = colourRoles.find(role => role.name.toLowerCase() === "colour u-" + msg.author.id) // checks if user role exists for author
                if (foundRole) { // yeah
                    foundRole.setColor(colour) // changes existing roles colour
                        .catch(function () {
                            msg.say("I am missing permissions. My role should be the highest in the server's role list.");
                        });
                    if (!msg.member.roles.has(foundRole.id)) { // if somehow member doesnt have it
                        await giveRole(msg, foundRole, true);
                    } else {
                        msg.say(`The colour of user role (${foundRole.name}) has been updated.`)
                    }
                } else { // nope
                    msg.guild.createRole({
                                name: 'colour u-' + msg.author.id,
                                color: colour,
                            },
                            `jColour: Colour update (=> Hex ${colour})`,
                        )
                        .then(role => giveRole(msg, role, true))
                        .catch(function () {
                            msg.say("I am missing permissions. My role should be the highest in the server's role list.");
                        });
                }
            }
        }

    } else {
        msg.say("That is not a hex colour! Please supply hex colours in #xxxxxx format (ex. #ffff00 for yellow")
    }


}

module.exports.giveRole = giveRole;
module.exports.giveRandomRole = giveRandomRole;
module.exports.giveSuitableRole = giveSuitableRole;
module.exports.checkDbl = checkDbl;
module.exports.checkHexPerms = checkHexPerms;
module.exports.giveHexRole = giveHexRole;