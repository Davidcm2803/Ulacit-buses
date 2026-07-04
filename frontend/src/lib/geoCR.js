import * as turf from "@turf/turf";

// El archivo pesa 146KB. Lo cargamos como fetch (no como import estático)
// para que NO infle el bundle de JS — se descarga una sola vez y queda
// en caché del navegador como cualquier asset estático.
// Debe vivir en: /public/data/cantones-cr.json
const GEOJSON_URL = "/data/cantones-cr.json";

let featuresPromise = null;

function loadFeatures() {
  if (!featuresPromise) {
    featuresPromise = fetch(GEOJSON_URL)
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo cargar cantones-cr.json");
        return res.json();
      })
      .then((geo) => geo.features);
  }
  return featuresPromise;
}

/**
 * Dado un lat/lng, devuelve { canton, provincia } o null si el punto
 */
export async function getCantonDeCoordenada(lat, lng) {
  const features = await loadFeatures();
  const punto = turf.point([lng, lat]); // turf usa [lng, lat]
  const feature = features.find((f) => turf.booleanPointInPolygon(punto, f));
  if (!feature) return null;
  return {
    canton: feature.properties.canton,
    provincia: feature.properties.provincia,
  };
}

/** Lista de cantones unicos para usar en <select>. */
export async function getListaCantones() {
  const features = await loadFeatures();
  const vistos = new Set();
  return features
    .map((f) => f.properties)
    .filter((p) => {
      if (vistos.has(p.canton)) return false;
      vistos.add(p.canton);
      return true;
    })
    .sort((a, b) => a.canton.localeCompare(b.canton));
}

/** Devuelve el Feature (con geometría) de un canton, para dibujarlo en el mapa. */
export async function getPoligonoCanton(nombreCanton) {
  const features = await loadFeatures();
  return features.find((f) => f.properties.canton === nombreCanton) || null;
}