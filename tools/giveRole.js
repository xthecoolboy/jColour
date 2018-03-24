async function giveRole(msg, chosenRole) {
    let rolesToRemove = []; // Init array for roles to remove

    // Loop through roles and filter
    msg.member.roles.array().forEach(function (element) {
        if (element.name.startsWith("colour ")) {
            rolesToRemove.push(element);
        }
    });

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

async function giveRandomRole(msg) { // FUNCTION THAT GIVES A RANDOM ROLE
    let colourRoles = []; // All colour roles
    let rolesToRemove = []; // Roles the user has
    msg.guild.roles.array().forEach(function (element) {
        if (element.name.startsWith("colour ")) {
            colourRoles.push(element);
            if (msg.member.roles.exists("id", element.id)) { //IF role is in members roles
                rolesToRemove.push(element);
            }

        }
    });

    const chosenRole = colourRoles[Math.floor(Math.random() * colourRoles.length)];

    let failed; // Prepare for spaghoot code

    // Updating the roles
    await msg.member.removeRoles(rolesToRemove, `jColour: Colour update (=> random, ${chosenRole.name})`).catch(function () {
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
            await msg.say("The (random) " + chosenRole.name + " has been added. Thanks for voting for me!")
        }
    }
}

module.exports.giveRole = giveRole;
module.exports.giveRandomRole = giveRandomRole;