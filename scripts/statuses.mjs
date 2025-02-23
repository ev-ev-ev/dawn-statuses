class DawnStatuses {
    static init() {
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
    }
}
Hooks.once("ready", DawnStatuses.init);
