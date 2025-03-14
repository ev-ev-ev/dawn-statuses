#!/bin/bash
#Update Module.json
cat <<< $(jq ".version=\"${tag#v}\"" module.json) > ./module.json
cat <<< $(jq ".download=\"https://github.com/ev-ev-ev/dawn-statuses/releases/download/${tag}/dawn-statuses.zip\"" module.json) > ./module.json
#Update foundry release packet
cat <<< $(jq ".release.compatibility=$(jq ".compatibility" module.json)" foundry_data.json) > ./foundry_data.json
cat <<< $(jq ".release.notes=\"https://github.com/ev-ev-ev/dawn-statuses/releases/tag/${tag}\"" foundry_data.json) > ./foundry_data.json
cat <<< $(jq ".release.version=\"${tag#v}\"" foundry_data.json) > ./foundry_data.json
#Compile all of the scraped files into the final JS
cat ./scripts/templates/templates.mjs.base ./scripts/templates/templates.json > ./scripts/templates/templates.mjs
cat ./scripts/techniques/techniques.mjs.base ./scripts/techniques/techniques.json > ./scripts/techniques/techniques.mjs
cat ./scripts/npcs/edges.mjs.base ./scripts/npcs/edges.json > ./scripts/npcs/edges.mjs
cat ./scripts/npcs/components.mjs.base ./scripts/npcs/components.json > ./scripts/npcs/components.mjs
cat ./scripts/npcs/techniques.mjs.base ./scripts/npcs/techniques.json > ./scripts/npcs/techniques.mjs
#Create package zip - we don't need the scraper data
zip -r ./dawn-statuses.zip module.json scripts/
