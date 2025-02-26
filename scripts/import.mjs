import { templates } from "./templates/templates.mjs";

async function restore(things, type, database) {
    let thingsInDatabase = {};

    for(let thing of database) {
        thingsInDatabase[thing.name] = thing.id;
    }

    for(let thing of things) {
        let thingName = thing.name;
        let thingSystem = thing.data;

        var thingInDatabase;
        if (thingsInDatabase.hasOwnProperty(thingName)) {
            thingInDatabase = type.get(thingsInDatabase[thingName]);
            await thingInDatabase.update(thing); // This SHOULD never do anything
        } else {
            thingInDatabase = await type.create(thing);
        }

        await thingInDatabase.update({system: thingSystem});
    }
}

async function restoreTemplates() {
    await restore(templates.items, Item, game.items);
    await restore(templates.actors, Actor, game.actors);
}

export async function setUpRestore() {
    game.chatCommands.register({
        "name": "/restoreDAWN",
        "module": "dawn-statuses",
        "description": "Overwrites any changes to the templates shipped with this module with their original version. If no templates are currently installed, install them.",
        "requiredRole": "GAMEMASTER",
        "callback": restoreTemplates
    });

    if (game.user.isGM && (game.items.size == 0 || game.actors.size == 0)) {
        // If we're definitely in a new world, just install everything immediately when the GM signs in for the first time.
        await restoreTemplates();
    }
}