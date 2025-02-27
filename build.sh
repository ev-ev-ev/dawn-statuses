#!/bin/bash
cat <<< $(jq ".version=\"${tag#v}\"" module.json) > ./module.json
cat ./scripts/templates/templates.mjs.base ./scripts/templates/templates.json > ./scripts/templates/templates.mjs
cat ./scripts/techniques/techniques.mjs.base ./scripts/techniques/techniques.json > ./scripts/techniques/techniques.mjs
cat ./scripts/npcs/edges.mjs.base ./scripts/npcs/edges.json > ./scripts/npcs/edges.mjs
cat ./scripts/npcs/components.mjs.base ./scripts/npcs/components.json > ./scripts/npcs/components.mjs
cat ./scripts/npcs/techniques.mjs.base ./scripts/npcs/techniques.json > ./scripts/npcs/techniques.mjs
zip -r ./dawn-statuses.zip module.json scripts/