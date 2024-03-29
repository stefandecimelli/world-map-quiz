mkdir -p src/assets/
jq 'reduce .features[] as $f ({}; .[$f.properties.ADMIN] = $f.properties)' geojson/countryNames.json > temp_props.json
jq --slurpfile props temp_props.json \
   '.features |= map(select(.geometry != null) | .properties |= . + ($props[0][.ADMIN] // {}))' \
   geojson/countryLines.json > temp2_props.json

jq -c . temp2_props.json > geojson/countries.json # This file goes into github.com/stefandecimelli/static-json-assets
rm temp_props.json temp2_props.json
