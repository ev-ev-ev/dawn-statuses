function search (chat, parameters, messageData) {
    let results = [];
    for (let item of game.items) {
        if (item.system.hasOwnProperty("props") && item.system.props.hasOwnProperty("Tags")) {
            if (item.system.props.Tags.includes(parameters)) {
                results.push(item);
            }
        }
    }
    results.sort((a, b) => a.name.localeCompare(b.name));
    let groups = {};
    for (let result of results) {
        let groupName = result.name.replace(/ \d$/, "");
        if (groups.hasOwnProperty(groupName)) {
            groups[groupName].push(result);
            groups[groupName].sort((a, b) => a.name.localeCompare(b.name));
        } else {
            groups[groupName] = [result];
        }
    }

    let groupedResults = [];
    for (let groupName of Object.keys(groups).sort()) {
        let formattedGroupItems = [];
        if (groups[groupName].length === 1) {
            let item = groups[groupName][0];
            formattedGroupItems.push(`@UUID[${item.uuid}]{${item.name}}`)
        } else {
            formattedGroupItems.push(`${groupName}: ${groups[groupName].map((item, i) => `@UUID[${item.uuid}]{${i+1}}`).join(" ")}`);
        }
        groupedResults.push(`<p>${formattedGroupItems}</p>`);
    }

    return {
        "content": groupedResults.join("")
    };
}

function searchAutoComplete (menu, alias, parameters) {
    let tags = new Set([]);
    for (let item of game.items) {
        if (item.system.hasOwnProperty("props") && item.system.props.hasOwnProperty("Tags")) {
            for (let tag of item.system.props.Tags.split(",")) {
                tags.add(tag.trim());
            }
        }
    }

    let entries = [];
    for (let tag of Array.from(tags).sort()) {
        if (tag.length > 0 && tag.includes(parameters)) {
            entries.push(game.chatCommands.createCommandElement(`${alias} ${tag}`, `Suggestion: <strong>${tag}</strong>`));
        }
    }
    entries.length = Math.min(entries.length, menu.maxEntries);
    return entries;
}

export async function setUpSearch() {
    game.chatCommands.register({
        "name": "/search",
        "module": "dawn-statuses",
        "description": "Search for techniques or n",
        "callback": search,
        "autocompleteCallback": searchAutoComplete
    });
}