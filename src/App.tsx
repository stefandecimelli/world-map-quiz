import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import style from "./App.module.css"
import 'leaflet/dist/leaflet.css';
import { features } from "./assets/countries.json"
import { Feature, GeoJsonObject } from 'geojson';
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';

const DEFAULT_TIMER = 1200; // Seconds

function App() {
  const [selectedCountries, setSelectedCountries] = useState<GeoJsonObject[]>([]);
  const [selectedCountryIndexes, setSelectedCountryIndexes] = useState<number[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [displayModel, setDisplayModel] = useState(false);
  const [seconds, setSeconds] = useState(DEFAULT_TIMER);
  const [x, setX] = useState(50);
  const [y, setY] = useState(0);

  const countryNames = useMemo(() => (features as Feature[]).map(country => ({
    names: getCountryNames(country),
    co: new L.GeoJSON(country as GeoJsonObject)
  })), [])

  useEffect(() => {
    const timer = setInterval(() => {
      if (seconds > 1) {
        setSeconds(seconds - 1);
      }
      else {
        clearInterval(timer);
        handleQuit();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  const handleInput = async (e: ChangeEvent<HTMLInputElement>) => {
    const countryGuess = e.target.value;
    const i = countryNames.findIndex(c => c.names.has(countryGuess.toLowerCase().trim()));
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
    setDisplayModel(true);
    setSeconds(0);
  }

  const handleRestart = () => {
    setSelectedCountries([]);
    setSelectedCountryIndexes([]);
    setDisplayModel(false);
    setX(50);
    setY(0);
    setSeconds(DEFAULT_TIMER);
  }

  const numberAchieved = selectedCountryIndexes.length;
  const numberAttempted = features.length;

  return (
    <div>
      <div className={style.mapContainer}>
        <Map selectedCountries={selectedCountries} x={x} y={y} />
        <div className={style.inputContainer}>
          <label htmlFor="guess" >Enter a country:</label>
          <input id="guess" className={style.input} type='text' onChange={handleInput} value={inputValue} />
          <div className={style.indicator}>{numberAchieved}/{numberAttempted}</div>
        </div>
        <div className={style.quitButtonContainer}>
          <div>{~~(seconds / 60)}m {seconds % 60}s</div>
          <button className={style.quitButton} onClick={handleQuit}>Quit</button>
        </div>
      </div>
      {displayModel && <div className={style.modal}>
        <div className={style.modalContent}>
          <button className={style.closeModel} onClick={handleRestart}>Restart</button>
          <h6>Score: {numberAchieved}/{numberAttempted} {(numberAchieved / numberAttempted * 100).toFixed(2)}%</h6>
          <u>Missed:</u>
          <div>
            {
              countryNames.map((_, i) => {
                const altNames = Array.from(countryNames[i]?.names).join(", ");
                const mainName = features[i]?.properties?.NAME;
                return selectedCountryIndexes.includes(i)
                  ? null
                  : <p key={mainName}>{mainName} <span>({altNames})</span></p>
              })
            }
          </div>
        </div>
      </div>}
    </div >
  )
}

export default App

function Map({ selectedCountries, x, y }: { selectedCountries: GeoJsonObject[], x: number, y: number }) {
  const geoJsonRef = useRef<L.GeoJSON>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (geoJsonRef.current) {
      geoJsonRef.current.clearLayers();
      geoJsonRef.current.addData(selectedCountries as never);
    }
  }, [selectedCountries]);

  useEffect(() =>  {
    if (mapRef.current) {
      mapRef.current.flyTo([x % 90, y % 90]);
    }
  }, [x, y]);

  return <MapContainer
    center={[x, y]}
    zoom={4}
    maxZoom={5}
    minZoom={3}
    className={style.map}
    maxBoundsViscosity={1}
    maxBounds={[[-180, -180], [180, 180]]}
    ref={mapRef}
  >
    <TileLayer
      url="http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png"
      attribution="&copy;OpenStreetMap, &copy;CartoDB"
      noWrap
    />
    <GeoJSON data={{ type: "FeatureCollection", features: selectedCountries } as never} ref={geoJsonRef} />
  </MapContainer>
}

function getCountryNames(country: Feature) {
  const keys = ['NAME', 'ADMIN', 'NAME_SORT', 'NAME_LONG', 'BRK_NAME', 'FORMAL_EN'];
  const names = new Set();

  keys.forEach(key => {
    const processedNames = processString(country.properties?.[key]);
    processedNames?.forEach(name => names.add(name));
  });

  return names;
}

function processString(str: string) {
  if (!str) return null;
  const lowerCased = str.toLowerCase();
  const noAccents = lowerCased.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return [
    noAccents.replace(".", "").trim(),
    noAccents.replace("the ", "").replace(".", "").trim(),
  ];
}

