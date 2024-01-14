jq 'reduce .features[] as $f ({}; .[$f.properties.ADMIN] = $f.properties)' src/assets/countryNames.json > temp_props.json
jq --slurpfile props temp_props.json '.features |= map(.properties |= . + ($props[0][.ADMIN] // {}))' src/assets/countryLines.json > temp2_props.json
jq -c . temp2_props.json > src/assets/countries.json
rm temp_props.json temp2_props.json
