import { templates } from "./templates/templates.mjs";
import { techniques } from "./techniques/techniques.mjs";
import { components } from "./npcs/components.mjs";
import { edges } from "./npcs/edges.mjs";

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
    await restoreComponents();
    await restoreEdges();
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

async function restoreEdges() {
    let edgeFolder = await folder("NPC Edges", "Item");
    let template = game.items.getName("{NPC Edge}");

    for (let edgeData of edges) {
        // {
        //     "name": "All-Seeing",
        //     "flavor": "Master of battlefield control and range.",
        //     "defensename": "\u201cPredictable\u201d",
        //     "turnname": "Piercing Vision (Misc Reaction)",
        //     "phasename": "\u201c...You\u2019ve Forced My Hand\u201d",
        //     "defense": "When this NPC would be Attacked they may gain [Tier \u00d7 2] Evasion. If the Attack misses, this NPC may move up to 3 spaces in any direction.",
        //     "turn": "When this NPC is at least 4 spaces away from a player and the player gets attacked, this may Mark them (before the attack is rolled or advantage is determined).",
        //     "phase": "When this NPC would be Knocked Out or pass a Health Gate you may spend 2 Antagonism and give all players 1 Influence to deploy 2 Artillery NPCs with Tiers equal to this NPC\u2019s and have this restore [Tier x 5] Health."
        //   },
        let name = edgeData.name;
        var edge = game.items.getName(name);
        if (!edge) { edge = await Item.create({name: name, type:"equippableItem"}); }
        await edge.update({
            "system": template.system,
            "system.template": template.id,
            "system.props": {
                "Defense": `<strong>${edgeData.defensename}</strong> ${edgeData.defense}`,
                "Start_Turn": `<strong>${edgeData.turnname}</strong>: ${edgeData.turn}`,
                "Phase": `<strong>${edgeData.phasename}</strong>: ${edgeData.phase}`
            },
            "folder": edgeFolder.id
        });
    }
}

async function restoreComponents() {
    let componentFolder = await folder("NPC Components", "Item");
    let folders = {
        DPS: await folder("DPS", "Item", componentFolder.id),
        Tank: await folder("Tank", "Item", componentFolder.id),
        Support: await folder("Support", "Item", componentFolder.id),
        Engine: await folder("Engine", "Item", componentFolder.id)
    };
    let template = game.items.getName("{NPC Component}");

    for (let componentData of components) {
        // {
        //     "name": "Assassin",
        //     "archetype": "DPS",
        //     "flavor": "Burst damage from stealth using Mark. E.g. Imperial Assassins, Wild Panthers, Lurking Ghosts.",
        //     "basehp": "13",
        //     "tierhp": "5",
        //     "speed": "3",
        //     "tierarmor": "0",
        //     "passive": "This NPC Disappears after Deploying. When this attacks a Marked character, this disappears if it wasn\u2019t already when it attacked.",
        //     "actionname": "Neutralize Target",
        //     "action": "Target any character and Mark them, this Mark cannot be lost.",
        //     "attackname": "Slice",
        //     "attack": "Roll 3 + [Tier] on an adjacent target. If this was Disappeared it may reappear in a space adjacent to the target, and gain 2 + [Tier] Advantage.\nReward: Deal [Hits] + [Tension] damage, if the target has no other adjacent characters deal [Tier] additional damage.",
        //     "attackdice": "3",
        //     "attacktierdice": "1",
        //     "attacktensionx": "1",
        //     "acename": "Hidden Blades",
        //     "acetension": "2",
        //     "ace": "For the rest of the Scene whenever this NPC disappears it leaves a \u201cHidden Blade\u201d in the space it left. Hidden Blades are spaces of difficult Terrain that deal [Tier] Damage to any character who moves into it, this also removes it."
        //   },
        let name = componentData.name;
        var component = game.items.getName(name);
        if (!component) { component = await Item.create({name: name, type:"equippableItem"}); }
        await component.update({
            "system": template.system,
            "system.template": template.id,
            "system.props": {
                "Base_Health": componentData.basehp,
                "Health_Per_Tier": componentData.tierhp,
                "Speed": componentData.speed,
                "Passive_Exists": componentData.passive != '',
                "Passive_Description": componentData.passive,
                "Attack_Exists": componentData.attackname != '',
                "Attack_Name": componentData.attackname,
                "Attack_Description": componentData.attack,
                "Attack_Dice": componentData.attackdice,
                "Attack_Tier_Dice": componentData.attacktierdice,
                "Attack_Tension_Multiplier": componentData.attacktensionx,
                "Action_Exists": componentData.actionname != '',
                "Action_Name": componentData.actionname,
                "Action_Description": componentData.action,
                "Ace_Exists": componentData.acename != '',
                "Ace_Name": componentData.acename,
                "Ace_Description": componentData.ace,
                "Ace_Tension_Min": componentData.acetension
            },
            "folder": folders[componentData.archetype].id
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