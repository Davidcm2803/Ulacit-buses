const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

export async function buscarDireccion(query) {
  if (!query || query.trim().length < 3) return [];

  const params = new URLSearchParams({
    q: query,
    format: "json",
    countrycodes: "cr",
    limit: "5",
  });

  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { "Accept-Language": "es" },
  });

  if (!res.ok) throw new Error("No se pudo buscar la dirección");

  const data = await res.json();
  return data.map((d) => ({
    label: d.display_name,
    lat: parseFloat(d.lat),
    lng: parseFloat(d.lon),
  }));
}