import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import style from "./App.module.css"
import 'leaflet/dist/leaflet.css';
import { features } from "./assets/countries.json"
import { Feature, GeoJsonObject } from 'geojson';
import { ChangeEvent, useMemo, useState } from 'react';
import L from 'leaflet';

function App() {
  const [selectedCountries, setSelectedCountries] = useState<GeoJsonObject[]>([]);
  const [selectedCountryIndexes, setSelectedCountryIndexes] = useState<number[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [displayModel, setDisplayModel] = useState(false);
  const [x, setX] = useState(50);
  const [y, setY] = useState(0);

  const countryNames = useMemo(() => (features as Feature[]).map(country => ({
    names: getCountryNames(country),
    co: new L.GeoJSON(country as GeoJsonObject)
  })), [])

  const handleInput = async (e: ChangeEvent<HTMLInputElement>) => {
    const countryGuess = e.target.value;
    const i = countryNames.findIndex(c => c.names.has(countryGuess.toLowerCase()));
    if (i >= 0 && !selectedCountryIndexes.includes(i)) {
      setSelectedCountryIndexes([...selectedCountryIndexes, i])
      setSelectedCountries([...selectedCountries, features[i] as GeoJsonObject]);
      setX(countryNames[i].co.getBounds().getCenter().lat)
      setY(countryNames[i].co.getBounds().getCenter().lng)
      setInputValue("");
    }
    else {
      setInputValue(countryGuess);
    }
  }

  const handleQuit = () => {
    setSelectedCountries([]);
    setSelectedCountryIndexes([]);
    setDisplayModel(true);
    setX(50);
    setY(0);
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
          <label htmlFor="guess" >Enter a country:</label>
          <input id="guess" className={style.input} type='text' onChange={handleInput} value={inputValue} />
          <div className={style.indicator}>{selectedCountryIndexes.length}/{features.length}</div>
        </div>
        <div className={style.quitButtonContainer}>
          <button className={style.quitButton} onClick={handleQuit}>Quit</button>
        </div>
      </div>
      {displayModel && <div className={style.modal}>
        <div className={style.modalContent}>
          <button className={style.closeModel} onClick={() => setDisplayModel(false)}>Restart</button>
          <p>Countries Missed:</p>
          <div>
            {
              Array.from({length: features.length}).filter((_, i) => !(i in selectedCountryIndexes)).map((_, i) => {
                return <p>{features[i]?.properties?.NAME} <span>({Array.from(countryNames[i]?.names).join(", ")})</span></p>
              })
            }
          </div>
        </div>
      </div>}
    </div >
  )
}

export default App

function getCountryNames(country: Feature): Set<string> {
  return new Set([
    country.properties?.NAME?.toLowerCase().replace(".", ""),
    country.properties?.NAME?.toLowerCase().replace("the ", "").replace(".", ""),
    country.properties?.ADMIN?.toLowerCase().replace(".", ""),
    country.properties?.ADMIN?.toLowerCase().replace("the ", "").replace(".", ""),
    country.properties?.NAME_SORT?.toLowerCase().replace(".", ""),
    country.properties?.NAME_SORT?.toLowerCase().replace("the ", "").replace(".", ""),
    country.properties?.NAME_LONG?.toLowerCase().replace(".", ""),
    country.properties?.NAME_LONG?.toLowerCase().replace("the ", "").replace(".", ""),
    country.properties?.BRK_NAME?.toLowerCase().replace(".", ""),
    country.properties?.BRK_NAME?.toLowerCase().replace("the ", "").replace(".", ""),
    country.properties?.FORMAL_EN?.toLowerCase().replace(".", ""),
    country.properties?.FORMAL_EN?.toLowerCase().replace("the ", "").replace(".", ""),
  ]);
}

