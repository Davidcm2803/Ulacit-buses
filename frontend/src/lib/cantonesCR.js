let cache = null;

export async function cargarCantonesCR() {
  if (cache) return cache;

  const res = await fetch("/data/cantones-cr.json");
  if (!res.ok) throw new Error("No se pudo cargar el catálogo de provincias y cantones");
  const geojson = await res.json();

  const mapa = new Map();
  for (const feature of geojson.features) {
    const { provincia, canton } = feature.properties;
    if (!provincia || !canton) continue;
    if (!mapa.has(provincia)) mapa.set(provincia, new Set());
    mapa.get(provincia).add(canton);
  }

  const provincias = [...mapa.keys()].sort();
  cache = provincias.map((provincia) => ({
    provincia,
    cantones: [...mapa.get(provincia)].sort(),
  }));

  return cache;
}