# World Map Quiz
**Stack**: React + TypeScript + Vite + Bun

**Creation**: 
```
bun create vite@latest world-map-quiz -- --template react-ts
cd world-map-quiz
bun i leaflet react-leaflet
```

## Goals
- **Project goal**: create a full-page map quiz, with country highlighting, that allows the user to pane arounf the map
- **Tech goal**: create something that uses vite and bun (my two favourite JS techs right now) at the same time
- **Tech goal**: learn how to use the [react-leaflet](https://react-leaflet.js.org/docs/start-introduction/) library

I was able to use https://mapshaper.org/ to reduce my geojson assets. Run `./combineGeoData.sh` to produce the final asset.