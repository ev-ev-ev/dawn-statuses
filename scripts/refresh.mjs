const NOTHING = 0;

async function findTemplate(templateID, cache) {
    if (!cache.hasOwnProperty(templateID)) {
        // We're not worrying about missing templates today
        cache[templateID] = (await Actor.get(templateID)) ?? NOTHING;
    }

    return cache[templateID];
}

async function findItem(itemName, templateID, outerCache) {
    if (!outerCache.hasOwnProperty(templateID)) {
        outerCache[templateID] = {};
    }

    let cache = outerCache[templateID];

    if (!cache.hasOwnProperty(itemName)) {
        let foundItem = game.items.find(i => i.name == itemName && i.system.template == templateID);
        if (!foundItem) {
            cache[itemName] = NOTHING;
        } else {
            let clone = JSON.parse(JSON.stringify(foundItem.system));
            // We don't want to update tiers on embedded items
            if (clone.props.hasOwnProperty("Tier")) {
                delete clone.props["Tier"];
            }
            cache[itemName] = clone;
        }
    }

    return cache[itemName];
}

export async function refreshCurrentScene() {
    // I think there are circumstances where no scene can be loaded.
    // I'm not 100% sure if the canvas is still there and I'm not testing it.
    if (!game.canvas || !game.canvas.scene) { return; }

    let actors = game.canvas.scene.tokens.map(t => t.actor);

    await refreshActors(actors);
}

export async function refresh() {
    await refreshActors(game.actors);
}

async function refreshActors(actors) {
    // TODO: Loop over Actors, refresh from template
    // TODO: Loop over an Actor's embedded items, refresh from template SANS tier
    let templates = {}; // Cache
    let items = {}; // Cache

    for (let actor of actors) {
        let template = await findTemplate(actor.system.template, templates);
        // This isn't something we recognize, so don't touch it
        if (template === NOTHING) { continue; }
        await actor.update({
            "system": template.system,
            "system.template": template.id
        });

        for (let embedded of actor.items) {
            let item = await findItem(embedded.name, embedded.system.template, items);
            // Custom tech/type, skip it
            if (item === NOTHING) { continue; }
            // This should have both the template and props in it
            await embedded.update({ "system": item });
        }
    }
}

export async function setUpRefresh () {
    game.chatCommands.register({
        "name": "/refreshSheets",
        "module": "dawn-statuses",
        "description": "Refresh all sheets from templates, even techniques already in use. NOTE: if you have edited anything OTHER than Tier, those changes will be overwritten. Also doesn't recover items from tokens embedded in scens.",
        "requiredRole": "GAMEMASTER",
        "callback": refresh
    });

    game.chatCommands.register({
        "name": "/refreshScene",
        "module": "dawn-statuses",
        "description": "Refresh all sheets in scnee from templates, even techniques already in use. NOTE: if you have edited anything OTHER than Tier, those changes will be overwritten. Also doesn't recover items from tokens embedded in scens.",
        "requiredRole": "GAMEMASTER",
        "callback": refreshCurrentScene
    });
}