#!/bin/bash
cat <<< $(jq ".version=\"${tag#v}\"" module.json) > ./module.json
cat ./scripts/templates/templates.mjs.base ./scripts/templates/templates.json > ./scripts/templates/templates.mjs
cat ./scripts/techniques/techniques.mjs.base ./scripts/techniques/techniques.json > ./scripts/techniques/techniques.mjs
zip -r ./dawn-statuses.zip module.json scripts/