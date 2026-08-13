import { useEffect, useState } from "react";

const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;
const ORS_DIRECTIONS_URL =
  "https://api.openrouteservice.org/v2/directions/driving-car/geojson";

export default function useTrazadoRuta(paradas = []) {
  const [coordenadas, setCoordenadas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!paradas || paradas.length < 2) {
      setCoordenadas([]);
      return;
    }

    const lineaRecta = paradas.map((p) => ({ lat: p.lat, lng: p.lng }));

    setCoordenadas(lineaRecta);

    if (!ORS_API_KEY) {
      setError("ORS_API_KEY no configurada");
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const coordinates = paradas.map((p) => [p.lng, p.lat]);

    fetch(ORS_DIRECTIONS_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: ORS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ coordinates }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`ORS respondio ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const geometry = data?.features?.[0]?.geometry?.coordinates;
        if (!geometry || geometry.length === 0) {
          throw new Error("Respuesta de ORS sin rutas");
        }
        const decodificadas = geometry.map(([lng, lat]) => ({ lat, lng }));
        setCoordenadas(decodificadas);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err.message);
        setCoordenadas(lineaRecta);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [JSON.stringify(paradas)]);

  return { coordenadas, loading, error };
}