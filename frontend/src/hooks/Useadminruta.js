import { useState } from "react";

const MAX_PARADAS = 10;
const MIN_DISTANCIA = 100;
const ORS_URL = "https://api.openrouteservice.org/v2/directions/driving-car/geojson";
const ORS_KEY = import.meta.env.VITE_ORS_API_KEY;

async function handleGuardar() {
  if (!validateForm()) return;
  const origen  = puntos.find((p) => p.tipo === "origen");
  const destino = puntos.find((p) => p.tipo === "destino");
  if (!origen || !destino) {
    setError("Debes definir origen y destino en el mapa");
    return;
  }
  if (trazado.length === 0) {
    setError("Debes generar el trazado por calles antes de guardar");
    return;
  }
  console.log("Guardar ruta:", { form, puntos, trazado, distanciaKm, tiempoMin });
}

function distanciaMetros(a, b) {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

export default function useAdminRuta() {
  const [puntos,      setPuntos]      = useState([]);
  const [modo,        setModo]        = useState("origen");
  const [trazado,     setTrazado]     = useState([]);
  const [distanciaKm, setDistanciaKm] = useState(null);
  const [tiempoMin,   setTiempoMin]   = useState(null);
  const [error,       setError]       = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [form,        setForm]        = useState({
    nombre: "", codigo: "", descripcion: "",
    primer_bus: "4:30", ultimo_bus: "22:00",
    frecuencia: "25", tarifa: "",
  });
  const [formErrors, setFormErrors] = useState({});

  function handleFormChange(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    setFormErrors((e) => ({ ...e, [key]: null }));
  }

  function handleMapClick(latlng) {
    setError(null);
    for (const p of puntos) {
      if (distanciaMetros(latlng, p) < MIN_DISTANCIA) {
        setError(`Demasiado cerca de otra parada (mínimo ${MIN_DISTANCIA}m)`);
        return;
      }
    }
    const paradasActuales = puntos.filter((p) => p.tipo === "parada").length;
    if (modo === "parada" && paradasActuales >= MAX_PARADAS) {
      setError(`Máximo ${MAX_PARADAS} paradas intermedias`);
      return;
    }
    if (modo === "origen"  && puntos.some((p) => p.tipo === "origen"))  return;
    if (modo === "destino" && puntos.some((p) => p.tipo === "destino")) return;

    const nuevoPunto = { ...latlng, tipo: modo };
    setPuntos((prev) => {
      if (modo === "destino") return [...prev, nuevoPunto];
      if (modo === "origen")  return [nuevoPunto, ...prev.filter((p) => p.tipo !== "origen")];
      const destIdx = prev.findIndex((p) => p.tipo === "destino");
      if (destIdx === -1) return [...prev, nuevoPunto];
      const next = [...prev];
      next.splice(destIdx, 0, nuevoPunto);
      return next;
    });
    if (modo === "origen")  setModo("parada");
    if (modo === "destino") setModo("parada");
  }

  function movePoint(index, latlng) {
    setPuntos((prev) => prev.map((p, i) => (i === index ? { ...p, ...latlng } : p)));
    setTrazado([]);
    setDistanciaKm(null);
    setTiempoMin(null);
  }

  function removePoint(index) {
    setPuntos((prev) => prev.filter((_, i) => i !== index));
    setTrazado([]);
    setDistanciaKm(null);
    setTiempoMin(null);
  }

  function clearAll() {
    setPuntos([]);
    setTrazado([]);
    setModo("origen");
    setDistanciaKm(null);
    setTiempoMin(null);
    setError(null);
  }

  async function generarTrazado() {
    const origen  = puntos.find((p) => p.tipo === "origen");
    const destino = puntos.find((p) => p.tipo === "destino");
    if (!origen || !destino) {
      setError("Necesitas al menos origen y destino");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const coordinates = puntos.map((p) => [p.lng, p.lat]);
      const res  = await fetch(ORS_URL, {
        method: "POST",
        headers: { Authorization: ORS_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ coordinates }),
      });
      const data  = await res.json();
      const geom  = data?.features?.[0]?.geometry?.coordinates;
      const props = data?.features?.[0]?.properties?.summary;
      if (!geom) throw new Error("Sin geometría");
      setTrazado(geom.map(([lng, lat]) => ({ lat, lng })));
      if (props) {
        setDistanciaKm((props.distance / 1000).toFixed(1));
        setTiempoMin(Math.round(props.duration / 60));
      }
    } catch (e) {
      setError("No se pudo generar el trazado: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  function validateForm() {
    const errs = {};
    if (!form.nombre)     errs.nombre     = "Requerido";
    if (!form.codigo)     errs.codigo     = "Requerido";
    if (!form.tarifa)     errs.tarifa     = "Requerido";
    if (!form.primer_bus) errs.primer_bus = "Requerido";
    if (!form.ultimo_bus) errs.ultimo_bus = "Requerido";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleGuardar() {
    if (!validateForm()) return;
    const origen  = puntos.find((p) => p.tipo === "origen");
    const destino = puntos.find((p) => p.tipo === "destino");
    if (!origen || !destino) {
      setError("Debes definir origen y destino en el mapa");
      return;
    }
    console.log("Guardar ruta:", { form, puntos, trazado, distanciaKm, tiempoMin });
  }

  return {
    puntos, modo, setModo, trazado,
    distanciaKm, tiempoMin,
    error, loading,
    form, formErrors, handleFormChange,
    handleMapClick, movePoint, removePoint, clearAll,
    generarTrazado, handleGuardar,
  };
}