import { useState } from "react";
import { routesService, stopsService } from "../config/api";
import { getCantonDeCoordenada } from "../lib/geoCR";

const MAX_PARADAS = 10;
const MIN_DISTANCIA = 100;
const ORS_URL =
  "https://api.openrouteservice.org/v2/directions/driving-car/geojson";
const ORS_KEY = import.meta.env.VITE_ORS_API_KEY;

const TIPO_LABEL = { origen: "Origen", parada: "Parada", destino: "Destino" };

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

function reordenarPorProximidad(puntos) {
  const origen = puntos.find((p) => p.tipo === "origen");
  const destino = puntos.find((p) => p.tipo === "destino");
  const paradas = puntos.filter((p) => p.tipo === "parada");

  if (!origen || paradas.length === 0) return puntos;

  const ordenadas = [];
  const pendientes = [...paradas];
  let actual = origen;

  while (pendientes.length > 0) {
    let minDist = Infinity,
      minIdx = 0;
    pendientes.forEach((p, i) => {
      const dist = distanciaMetros(actual, p);
      if (dist < minDist) {
        minDist = dist;
        minIdx = i;
      }
    });
    ordenadas.push(pendientes[minIdx]);
    actual = pendientes[minIdx];
    pendientes.splice(minIdx, 1);
  }

  return [origen, ...ordenadas, ...(destino ? [destino] : [])];
}

function validateForm(form, setFormErrors) {
  const errs = {};
  if (!form.nombre) errs.nombre = "Requerido";
  if (!form.codigo) errs.codigo = "Requerido";
  if (!form.tarifa) errs.tarifa = "Requerido";
  if (!form.primer_bus) errs.primer_bus = "Requerido";
  if (!form.ultimo_bus) errs.ultimo_bus = "Requerido";
  setFormErrors(errs);
  return Object.keys(errs).length === 0;
}

export default function useAdminRuta() {
  const [puntos, setPuntos] = useState([]);
  const [modo, setModo] = useState("origen");
  const [trazado, setTrazado] = useState([]);
  const [distanciaKm, setDistanciaKm] = useState(null);
  const [tiempoMin, setTiempoMin] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    codigo: "",
    descripcion: "",
    primer_bus: "04:30",
    ultimo_bus: "22:00",
    frecuencia: "25",
    tarifa: "",
    canton_origen: "",
    provincia_origen: "",
  });
  const [formErrors, setFormErrors] = useState({});

  function handleFormChange(key, value) {
    if (key === "canton_origen" && value) {
      const origen = puntos.find((p) => p.tipo === "origen");
      if (origen && origen.canton && origen.canton !== value) {
        alert(
          `El cantón "${value}" no coincide con el punto de origen que ya pusiste en el mapa (está en ${origen.canton}, ${origen.provincia}). ` +
            `Borra ese punto y vuelve a marcarlo, o elige "${origen.canton}" aquí.`,
        );
        return;
      }
    }

    setForm((f) => ({ ...f, [key]: value }));
    setFormErrors((e) => ({ ...e, [key]: null }));
  }

  async function handleMapClick(latlng) {
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

    if (modo === "origen" && puntos.some((p) => p.tipo === "origen")) return;
    if (modo === "destino" && puntos.some((p) => p.tipo === "destino")) return;

    if (modo === "origen" && !form.canton_origen) {
      alert(
        "Selecciona primero la provincia y el cantón de origen en el formulario de la izquierda.",
      );
      return;
    }

    let ubicacion = null;
    try {
      ubicacion = await getCantonDeCoordenada(latlng.lat, latlng.lng);
    } catch {
      setError("No se pudo verificar la ubicación. Intenta de nuevo.");
      return;
    }
    if (!ubicacion) {
      setError("Ese punto cae fuera del territorio de Costa Rica");
      return;
    }

    if (modo === "origen" && ubicacion.canton !== form.canton_origen) {
      setError(
        `Estás fuera del cantón seleccionado (${form.canton_origen}). Verifica el punto en el mapa o cambia el cantón en el formulario de la izquierda.`,
      );
      return;
    }

    const nuevoPunto = { ...latlng, tipo: modo, nombre: "", ...ubicacion };

    setPuntos((prev) => {
      let next;
      if (modo === "destino") {
        next = [...prev, nuevoPunto];
      } else if (modo === "origen") {
        next = [nuevoPunto, ...prev.filter((p) => p.tipo !== "origen")];
      } else {
        const destIdx = prev.findIndex((p) => p.tipo === "destino");
        if (destIdx === -1) next = [...prev, nuevoPunto];
        else {
          next = [...prev];
          next.splice(destIdx, 0, nuevoPunto);
        }
      }
      return reordenarPorProximidad(next);
    });

    if (modo === "origen") setModo("parada");
    if (modo === "destino") setModo("parada");
  }

  async function movePoint(index, latlng) {
    const puntoActual = puntos[index];

    let ubicacion = null;
    try {
      ubicacion = await getCantonDeCoordenada(latlng.lat, latlng.lng);
    } catch {
      ubicacion = null;
    }

    if (
      puntoActual?.tipo === "origen" &&
      form.canton_origen &&
      ubicacion &&
      ubicacion.canton !== form.canton_origen
    ) {
      setError(
        `Estás fuera del cantón seleccionado (${form.canton_origen}). Verifica el punto en el mapa o cambia el cantón en el formulario de la izquierda.`,
      );
      return;
    }

    if (!ubicacion) {
      setError("Ese punto cae fuera del territorio de Costa Rica");
      return;
    }

    setPuntos((prev) => {
      const next = prev.map((p, i) =>
        i === index ? { ...p, ...latlng, ...ubicacion } : p,
      );
      return reordenarPorProximidad(next);
    });

    setTrazado([]);
    setDistanciaKm(null);
    setTiempoMin(null);
  }

  function renamePoint(index, nombre) {
    setPuntos((prev) =>
      prev.map((p, i) => (i === index ? { ...p, nombre } : p)),
    );
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
    setSuccess(false);
  }

  async function generarTrazado() {
    const origen = puntos.find((p) => p.tipo === "origen");
    const destino = puntos.find((p) => p.tipo === "destino");
    if (!origen || !destino) {
      setError("Necesitas al menos origen y destino");
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const coordinates = puntos.map((p) => [p.lng, p.lat]);
      const res = await fetch(ORS_URL, {
        method: "POST",
        headers: { Authorization: ORS_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ coordinates }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `Error ${res.status}`);
      }
      const data = await res.json();
      const geom = data?.features?.[0]?.geometry?.coordinates;
      const props = data?.features?.[0]?.properties?.summary;
      if (!geom) throw new Error("Sin geometría");

      const trazadoGenerado = geom.map(([lng, lat]) => ({ lat, lng }));
      let distanciaGenerada = null;
      let tiempoGenerado = null;

      setTrazado(trazadoGenerado);
      if (props) {
        distanciaGenerada = Number((props.distance / 1000).toFixed(1));
        tiempoGenerado = Math.round(props.duration / 60);
        setDistanciaKm(distanciaGenerada);
        setTiempoMin(tiempoGenerado);
      }

      return {
        trazado: trazadoGenerado,
        distanciaKm: distanciaGenerada,
        tiempoMin: tiempoGenerado,
      };
    } catch (e) {
      setError(
        e.message.includes("404") || e.message.includes("2009")
          ? "Ruta fuera del área soportada. Usa puntos dentro del GAM."
          : "No se pudo generar el trazado: " + e.message,
      );
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function handleGuardar() {
    if (!validateForm(form, setFormErrors)) return;

    const origen = puntos.find((p) => p.tipo === "origen");
    const destino = puntos.find((p) => p.tipo === "destino");
    if (!origen || !destino) {
      setError("Debes definir origen y destino en el mapa");
      return;
    }

    if (!form.canton_origen) {
      alert(
        "Debes seleccionar la provincia y el cantón de origen antes de guardar.",
      );
      return;
    }
    if (origen.canton !== form.canton_origen) {
      alert(
        `El cantón elegido en el formulario (${form.canton_origen}) no coincide con el punto de origen en el mapa (${origen.canton}). Corrígelo antes de guardar.`,
      );
      return;
    }

    let trazadoFinal = trazado;
    let distanciaFinal = distanciaKm;
    let tiempoFinal = tiempoMin;

    if (trazadoFinal.length === 0) {
      const resultado = await generarTrazado();
      if (!resultado) {
        setError(
          "No se pudo generar el trazado del recorrido. Genera el trazado antes de guardar.",
        );
        return;
      }
      trazadoFinal = resultado.trazado;
      distanciaFinal = resultado.distanciaKm;
      tiempoFinal = resultado.tiempoMin;
    }

    setLoading(true);
    setError(null);
    try {
      const ruta = await routesService.create({
        nombre: form.nombre,
        codigo: form.codigo,
        descripcion: form.descripcion,
        primer_bus: form.primer_bus,
        ultimo_bus: form.ultimo_bus,
        frecuencia: Number(form.frecuencia),
        tarifa: Number(form.tarifa),
        distancia_km: distanciaFinal,
        tiempo_min: tiempoFinal,
        trazado: trazadoFinal,
        canton_origen: origen.canton,
        provincia_origen: origen.provincia,
        canton_destino: destino.canton,
        provincia_destino: destino.provincia,
      });

      await Promise.all(
        puntos.map((p, i) =>
          stopsService.create({
            nombre: p.nombre?.trim() || `${TIPO_LABEL[p.tipo]} ${i + 1}`,
            lat: p.lat,
            lng: p.lng,
            tipo: p.tipo,
            orden: i,
            canton: p.canton,
            provincia: p.provincia,
            route_id: ruta.id,
          }),
        ),
      );

      const nombre = form.nombre;
      const codigo = form.codigo;
      setSuccess(true);
      clearAll();
      setTimeout(
        () => alert(`Ruta "${nombre}" (${codigo}) guardada correctamente`),
        100,
      );
    } catch (e) {
      setError("Error al guardar: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  return {
    puntos,
    modo,
    setModo,
    trazado,
    distanciaKm,
    tiempoMin,
    error,
    loading,
    success,
    form,
    formErrors,
    handleFormChange,
    handleMapClick,
    movePoint,
    renamePoint,
    removePoint,
    clearAll,
    generarTrazado,
    handleGuardar,
  };
}