import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import style from "./App.module.css"
import 'leaflet/dist/leaflet.css';
import { features } from "./assets/geodata.json"
import { GeoJsonObject } from 'geojson';
import { useMemo, useState } from 'react';
import L from 'leaflet';

function App() {
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const countryNames = useMemo(() => features.map(country => {
    return new L.GeoJSON(country, {name: country.properties.name.toLowerCase()})
  }), [])

  const [x, setX] = useState(51.505);
  const [y, setY] = useState(0);


  const handleInput = async (e) => {
    const countryGuess = e.target.value;
    const i = countryNames.findIndex(c => c.options?.name === countryGuess.toLowerCase());
    if (i >= 0) {
      setSelectedCountries([...selectedCountries, features[i]]);
      setX(countryNames[i].getBounds().getCenter().lat)
      setY(countryNames[i].getBounds().getCenter().lng)
      setInputValue("");
    }
    else {
      setInputValue(countryGuess);
    }
  }

  console.log(selectedCountries)

  return (
    <div>
      <div className={style.mapContainer}>
        <MapContainer center={[x, y]} zoom={4} scrollWheelZoom={false} className={style.map} key={`${x}${y}`}>
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
