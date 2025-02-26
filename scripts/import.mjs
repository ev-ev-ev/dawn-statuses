import { templates } from "./templates/templates.mjs";

async function restore(things, type, database, folder) {
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

        await thingInDatabase.update({folder: folder.id, system: thingSystem});
    }
}

async function folder(name, type) {
    var folder;
    folder = game.folders.contents.find(f => f.name == name && f.type == type);
    if (!folder) { folder = await Folder.create({name: name, type: type}); }
    return folder;
}

async function restoreTemplates() {
    await restore(templates.items, Item, game.items, await folder("Templates", "Item"));
    await restore(templates.actors, Actor, game.actors, await folder("Templates", "Actor"));
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