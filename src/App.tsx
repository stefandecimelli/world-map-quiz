import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import style from "./App.module.css"
import 'leaflet/dist/leaflet.css';
import { features } from "./assets/geodata.json"
import { GeoJsonObject } from 'geojson';
import { ChangeEvent, useMemo, useState } from 'react';
import L from 'leaflet';

function App() {

  const [selectedCountries, setSelectedCountries] = useState<GeoJsonObject[]>([]);
  const [inputValue, setInputValue] = useState("");

  const countryNames = useMemo(() => features.map(country => ({
    names: new Set([
      country.properties.name.toLowerCase(),
    ]),
    co: new L.GeoJSON(country as GeoJsonObject)
  })), [])

  const [x, setX] = useState(51.505);
  const [y, setY] = useState(0);


  const handleInput = async (e: ChangeEvent<HTMLInputElement>) => {
    const countryGuess = e.target.value;
    const i = countryNames.findIndex(c => c.names.has(countryGuess.toLowerCase()));
    if (i >= 0) {
      setSelectedCountries([...selectedCountries, features[i] as GeoJsonObject]);
      setX(countryNames[i].co.getBounds().getCenter().lat)
      setY(countryNames[i].co.getBounds().getCenter().lng)
      setInputValue("");
    }
    else {
      setInputValue(countryGuess);
    }
  }

  return (
    <div>
      <div className={style.mapContainer}>
        <MapContainer center={[x, y]} zoom={4} className={style.map} key={`${x}${y}`}>
          <TileLayer
            url="http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png"
            attribution="&copy;OpenStreetMap, &copy;CartoDB"
          />
          <GeoJSON data={{ "type": "FeatureCollection", "features": selectedCountries } as GeoJsonObject} />
        </MapContainer>
        <div className={style.inputContainer}>
          <label htmlFor="guess" >Enter a country guess:</label>
          <input id="guess" className={style.input} type='text' onChange={handleInput} value={inputValue} />
        </div>
      </div>
    </div >
  )
}

export default App
