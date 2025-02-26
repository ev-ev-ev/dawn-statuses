import { setUpRestore } from "./import.mjs";
let templateCache = {};
let actorCache = {};

class DawnStatuses {
    static init() {
        setUpRestore();
        CONFIG.statusEffects = [
            // Generic
            {
                "id": "dead",
                "name": "Taken Out",
                "img": "icons/svg/skull.svg"
            },

            // Positive Effects
            {
                "id": "banish",
                "name": "Banished",
                "img": "icons/svg/sleep.svg"
            },
            {
                "id": "haste",
                "name": "Hastened",
                "img": "icons/svg/wingfoot.svg"
            },
            {
                "id": "invisible",
                "name": "Invisible",
                "img": "icons/svg/invisible.svg"
            },
            {
                "id": "regen",
                "name": "Regenerating",
                "img": "icons/svg/regen.svg"
            },
            {
                "id": "reinforced",
                "name": "Reinforced",
                "img": "icons/svg/shield.svg"
            },
            {
                "id": "steady",
                "name": "Steadied",
                "img": "icons/svg/statue.svg"
            },
            {
                "id": "strengthen",
                "name": "Strengthened",
                "img": "icons/svg/upgrade.svg"
            },

            // Negative Effects
            {
                "id": "blight",
                "name": "Blighted",
                "img": "icons/svg/blood.svg"
            },
            {
                "id": "daze",
                "name": "Dazed",
                "img": "icons/svg/daze.svg"
            },
            {
                "id": "fear",
                "name": "Feared",
                "img": "icons/svg/terror.svg"
            },
            {
                "id": "immobilize",
                "name": "Immobilized",
                "img": "icons/svg/cancel.svg"
            },
            {
                "id": "launch",
                "name": "Launched",
                "img": "icons/svg/falling.svg"
            },
            {
                "id": "mark",
                "name": "Marked",
                "img": "icons/svg/target.svg"
            },
            {
                "id": "slow",
                "name": "Slowed",
                "img": "icons/svg/stoned.svg"
            },
            {
                "id": "shred",
                "name": "Shredded",
                "img": "icons/svg/hazard.svg"
            },
            {
                "id": "snare",
                "name": "Snared",
                "img": "icons/svg/trap.svg"
            },
            {
                "id": "taunt",
                "name": "Taunted",
                "img": "icons/svg/combat.svg"
            },
            {
                "id": "weak",
                "name": "Weakened",
                "img": "icons/svg/downgrade.svg"
            }
        ];

        // Automatic tension using party resources
        if (game.user.isGM) {
            Hooks.on("combatStart", DawnStatuses.combatStart);
            Hooks.on("combatRound", DawnStatuses.combatRound);
            Hooks.on("updateCombatant", DawnStatuses.updateCombatant);
            Hooks.on("deleteCombatant", DawnStatuses.deleteCombatant);
        }
    }

    static ensureTension() {
        // I'm not actually sure how to do this.
    }

    static combatStart(combat, updateData) {
        DawnStatuses.ensureTension();
        pr.api.set("tension", 0);
    }

    static combatRound(combat, updateData, updateOptions) {
        DawnStatuses.ensureTension();
        // direction is 1 for going to a new round, and -1 for going to the previous round.
        pr.api.increment("tension", updateOptions.direction);
    }

    // A PC is not generally going to be able to increment tension.
    // They may, however, delete their token when taken out.
    // Alternatively, the GM may mark them as defeated.
    // So long as one of these things happen we should increment tension.
    // If BOTH happen, we need to increment tension only once.
    // Unlike PCs, NPCs are all controlled by the GM, so we can do that directly

    // TODO: GMs seem to like manually toggling NPC traits, or deleting them when killed.

    static combatantIsPC(combatant) {
        if (actorCache.hasOwnProperty(combatant.actorId)) {
            return actorCache[combatant.actorId];
        }

        // Repeatedly querying the actor database is probably not fast. Cache the result.
        let actor = game.actors.get(combatant.actorId);
        let templateId = actor.system.template;

        if (templateCache.hasOwnProperty(templateId)) {
            actorCache[combatant.actorId] = templateCache[templateId];
        } else {
            let template = game.actors.get(templateId);
            templateCache[templateId] = template.name === "PC Template"
            actorCache[combatant.actorId] = templateCache[templateId];
        }

        return actorCache[combatant.actorId];
    }

    static updateCombatant(combatant, change) {
        if (!DawnStatuses.combatantIsPC(combatant)) { return; }
        // This hook gets called A LOT, so we have to filter
        if (change.hasOwnProperty("defeated") && change.defeated === true) {
            pr.api.increment("tension");
        }
    }

    static deleteCombatant(combatant) {
        if (!DawnStatuses.combatantIsPC(combatant)) { return; }
        if (combatant.defeated) { return }
        pr.api.increment("tension")
    }
}
Hooks.once("ready", DawnStatuses.init);
