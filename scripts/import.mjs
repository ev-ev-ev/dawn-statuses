import { templates } from "./templates/templates.mjs";
import { techniques } from "./techniques/techniques.mjs";

async function restoreTemplates(things, type, database, folder) {
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

async function folder(name, type, parentFolderId="") {
    var folder;
    folder = game.folders.contents.find(f => f.name == name && f.type == type);
    if (!folder) { folder = await Folder.create({name: name, type: type}); }
    if (folder.folder != parentFolderId) { await folder.update({folder: parentFolderId})}
    return folder;
}

async function restore() {
    await restoreTemplates(templates.items, Item, game.items, await folder("Templates", "Item"));
    await restoreTemplates(templates.actors, Actor, game.actors, await folder("Templates", "Actor"));
    await restoreTechniques();
}

async function restoreTechniques() {
    let techFolder = await folder("PC Techniques", "Item");
    let folders = {
        Powerhouse: await folder("Powerhouse", "Item", techFolder.id),
        Vagabond: await folder("Vagabond", "Item", techFolder.id),
        Bulwark: await folder("Bulwark", "Item", techFolder.id),
        Altruist: await folder("Altruist", "Item", techFolder.id),
        Disruptor: await folder("Disruptor", "Item", techFolder.id),
        Ruiner: await folder("Ruiner", "Item", techFolder.id)
    };
    let template = game.items.getName("[Technique]");

    for (let techniqueData of techniques) {
        // {
        //     "tech": "Berserker",
        //     "archetype": "Powerhouse",
        //     "tags": "Revenge, Wounds, Tanking",
        //     "stars": "\u2605",
        //     "flavor": "\u201cTo stagnate is to forget your purpose, to still is to die.Here you\u2019ll live, each scar a mark of pride, each beat ofyour heart a melody all your own.\u201d",
        //     "level": "1",
        //     "name": "Revenge",
        //     "text": "After you take a Wound, you may spend up to 2 AP as if it was your turn, all Actions you take when doing this count as Reactions."
        // },
        let name = `${techniqueData.tech} ${techniqueData.level}`;
        var technique = game.items.getName(name);
        if (!technique) { technique = await Item.create({name: name, type:"equippableItem"}); }
        await technique.update({
            "system": template.system,
            "system.template": template.id,
            "system.props": {
                "Archetype": techniqueData.archetype,
                "Description": `<strong>${techniqueData.name}</strong>: ${techniqueData.text}`
            },
            "folder": folders[techniqueData.archetype].id
        });
    }
}

export async function setUpRestore() {
    game.chatCommands.register({
        "name": "/restoreDAWN",
        "module": "dawn-statuses",
        "description": "Overwrites any changes to the templates shipped with this module with their original version. If no templates are currently installed, install them.",
        "requiredRole": "GAMEMASTER",
        "callback": restore
    });

    if (game.user.isGM && (game.items.size == 0 || game.actors.size == 0)) {
        // If we're definitely in a new world, just install everything immediately when the GM signs in for the first time.
        await restore();
    }
}