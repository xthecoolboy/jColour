const getColors = require('get-image-colors')
const chroma = require("chroma-js")

const config = require('./../config/config.json');

const DBL = require("dblapi.js");
const dbl = new DBL(config.dblToken);

/* 

The holy piece of code that makes the thing work

*/

async function giveThings(options) {
    /*
    {
        msg: {object},
        removeRoles: [array],
        addRole: [array],
        deleteUserRoles: boolean,
        createRole: {object}.
        message: string
    }
    */
    let failed;
    if (!failed && options.removeRoles) {
        await options.msg.member.removeRoles(
            options.removeRoles,
            "jColour: Colour update"
        ).catch(function () {
            options.msg.say("I am missing permissions. My role should be the highest in the server's role list.");
            failed = true;
        });
    }
    if (!failed && options.addRole) {
        await options.msg.member.addRole(
            options.addRole,
            "jColour: Colour update"
        ).catch(function () {
            options.msg.say("I am missing permissions. My role should be the highest in the server's role list.");
            failed = true;
        });
    }
    if (!failed && options.deleteUserRoles) {
        const userRole = options.msg.guild.roles.find(
            role => role.name.toLowerCase() === "colour u-" + options.msg.author.id
        );

        if (userRole) {
            userRole.delete("jColour: Colour update")
                .catch(function () {
                    options.msg.say("I am missing permissions. My role should be the highest in the server's role list.");
                    failed = true;
                });
        }
    }

    if (!failed && options.createRole) {
        let colour = options.createRole.color; // discord thinks #000000 and no colour are the same thing
        if (chroma(options.createRole.colour).hex() === chroma("#000000").hex()) {
            colour = "#010000";
        }
        options.msg.guild.createRole({
                    // name: 'colour u-' + msg.author.id,
                    name: options.createRole.name,
                    color: colour
                },
                `jColour: Colour update`,
            )
            .then(role => options.msg.member.addRole(
                role,
                "jColour: Colour update"
            ))
            .catch(function () {
                msg.say("I am missing permissions. My role should be the highest in the server's role list.");
                failed = true;
            });
    }

    if (!failed) {
        options.msg.say(options.message)
    }
}


/*

STUFF 

*/

async function giveRole(msg, chosenRole) {
    const rolesToRemove = msg.guild.roles.filter(role => role.name.toLowerCase().startsWith("colour ") & role !== chosenRole);

    if (chosenRole.name.startsWith("colour u-")) {
        msg.say("That is a user role, you can't have it.")
    } else {

        await giveThings({
            msg: msg,
            removeRoles: rolesToRemove,
            addRole: chosenRole,
            deleteUserRoles: true,
            createRole: null,
            message: `The ${chosenRole.name} (${chosenRole.hexColor}) has been added.`
        })


    }
}

async function giveRandomRole(msg, prefix, client) { // FUNCTION THAT GIVES A RANDOM ROLE
    const colourRoles = msg.guild.roles.filter(
        role => role.name.toLowerCase().startsWith("colour ") && !role.name.toLowerCase().startsWith("colour u-")
    );

    const chosenRole = colourRoles.array()[Math.floor(Math.random() * colourRoles.array().length)];
    const noChosenRole = colourRoles.filter(
        role => role !== chosenRole
    );

    if (chosenRole) {
        await giveThings({
            msg: msg,
            removeRoles: noChosenRole,
            addRole: chosenRole,
            deleteUserRoles: true,
            createRole: null,
            message: `The random ${chosenRole.name} (${chosenRole.hexColor}) has been added.`
        })
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

        const colourRoles = msg.guild.roles.filter(
            role => role.name.toLowerCase().startsWith("colour ") && !role.name.toLowerCase().startsWith("colour u-")
        );

        colourRoles.array().forEach(function (element) {
            const distance = chroma.distance(element.hexColor, color, "lab");
            // lab distance between colours

            if (distance < smallestDistance.distance) { // Replaces if smaller
                smallestDistance = {
                    id: element.id,
                    distance: distance
                }
            }

        });

        const chosenRole = msg.guild.roles.find("id", smallestDistance.id);
        const noChosenRole = colourRoles.filter(
            role => role !== chosenRole
        );

        if (chosenRole) {
            giveThings({
                msg: msg,
                removeRoles: noChosenRole,
                addRole: chosenRole,
                deleteUserRoles: true,
                createRole: null,
                message: `I chose the ${chosenRole.name} (${chosenRole.hexColor}) for you based on your avatar.`
            })
        } else {
            msg.say(`There are no roles setup! Please check out ${prefix}tutorial`)
        }

    })
};

async function removeRole(msg) {
    const rolesToRemove = msg.guild.roles.filter(role => role.name.toLowerCase().startsWith("colour ") && role.name !== "colour u-" + msg.author.id);
    await giveThings({
        msg: msg,
        removeRoles: rolesToRemove,
        addRole: null,
        deleteUserRoles: true,
        createRole: null,
        message: "All roles have been removed from you."
    })
}

async function giveHexRole(msg, client, prefix, colour) {
    const pickRole = ["suitable", "pick", "choose"].includes(colour.toLowerCase());
    const randomRole = colour.toLowerCase() === "random";
    if (pickRole) {
        if (checkDbl(msg, client)) {
            getColors(msg.author.displayAvatarURL, function (err, colors) {
                if (err) throw err
                colour = chroma(colors[0]).hex();
                giveActualHexRole(msg, client, prefix, colour, "(suitable) ")
            })
        } else {
            msg.say("Sorry, but to use this command you need to vote for the bot every month at https://discordbots.org/bot/" + client.user.id);
        }
    } else if (randomRole) {
        colour = chroma(
            Math.floor(Math.random() * 360), // hue 0-360
            Math.random(), // saturation 0-1
            Math.random(), // Lightness 0-1 
            'hsl').hex() // hsl colour space
        giveActualHexRole(msg, client, prefix, colour, "(random) ")
    } else {
        await giveActualHexRole(msg, client, prefix, colour, "")
    }

    async function giveActualHexRole(msg, client, prefix, colour, extraWord) {

        if (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(colour)) { // Checks that it indeed is a hex colour

            const colourRoles = msg.guild.roles.filter(role => role.name.toLowerCase().startsWith("colour ")); // all colour roles
            const noUserRoles = colourRoles.filter(role => !role.name.toLowerCase().startsWith("colour u-")); // no colour u-39832958392 roles
            const noUsersRole = colourRoles.filter(role => !(role.name.toLowerCase() === "colour u-" + msg.author.id)); // all roles except users own

            if (noUserRoles.find("hexColor", chroma(colour).hex())) { // tries to find an exiting role with same color
                const foundRole = noUserRoles.find("hexColor", chroma(colour).hex()) // Converting so ex. #fff and #ffffff work
                await giveThings({
                    msg: msg,
                    removeRoles: noUsersRole,
                    addRole: foundRole,
                    deleteUserRoles: true,
                    createRole: null,
                    message: `I gave you the ${extraWord}${foundRole.name} since it has exactly the same colour (${foundRole.hexColor}).`
                })
            } else { // no existing roles found

                let trueColour = colour; // discord thinks #000000 and no colour are the same thing
                if (chroma(colour).hex() === chroma("#000000").hex()) {
                    trueColour = "#010000";
                }
                const foundRole = colourRoles.find(role => role.name.toLowerCase() === "colour u-" + msg.author.id) // checks if user role exists for author
                if (foundRole) { // yeah
                    foundRole.setColor(trueColour) // changes existing roles colour
                        .catch(function () {
                            msg.say("I am missing permissions. My role should be the highest in the server's role list.");
                        });
                    if (!msg.member.roles.has(foundRole.id)) { // if somehow member doesnt have it
                        await giveThings({
                            msg: msg,
                            removeRoles: noUsersRole,
                            addRole: foundRole,
                            deleteUserRoles: false,
                            createRole: null,
                            message: `Gave you the role with the ${extraWord}colour ${colour}.`
                        })
                    } else {
                        msg.say(`The colour of user role has been updated to ${extraWord}${colour}.`)
                    }
                } else { // nope
                    await giveThings({
                        msg: msg,
                        removeRoles: noUsersRole,
                        addRole: null,
                        deleteUserRoles: false,
                        createRole: {
                            name: "colour u-" + msg.author.id,
                            colour: colour
                        },
                        message: `Made a new role with the colour ${colour}`
                    })
                }
            }

        } else {
            msg.say("That is not a hex colour! Please supply hex colours in #xxxxxx format (ex. #ffff00 for yellow")
        }

    }


}


/*

CHECKS

*/

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

module.exports.giveRole = giveRole;
module.exports.giveRandomRole = giveRandomRole;
module.exports.giveSuitableRole = giveSuitableRole;
module.exports.checkDbl = checkDbl;
module.exports.checkHexPerms = checkHexPerms;
module.exports.giveHexRole = giveHexRole;
module.exports.removeRole = removeRole;