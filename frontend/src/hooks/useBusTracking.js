import { useEffect, useState } from "react";

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

// Interpola una posición sobre una lista de puntos [{lat,lng}, ...]
// según una fracción de avance entre 0 y 1.
function interpolarSobreTrazado(trazado, fraccion) {
  if (!trazado || trazado.length === 0) return null;
  if (trazado.length === 1) return trazado[0];

  const distancias = [];
  let total = 0;
  for (let i = 0; i < trazado.length - 1; i++) {
    const d = distanciaMetros(trazado[i], trazado[i + 1]);
    distancias.push(d);
    total += d;
  }
  if (total === 0) return trazado[0];

  const objetivo = fraccion * total;
  let acumulado = 0;

  for (let i = 0; i < distancias.length; i++) {
    const d = distancias[i];
    if (acumulado + d >= objetivo) {
      const restante = objetivo - acumulado;
      const t = d === 0 ? 0 : restante / d;
      const a = trazado[i];
      const b = trazado[i + 1];
      return {
        lat: a.lat + (b.lat - a.lat) * t,
        lng: a.lng + (b.lng - a.lng) * t,
      };
    }
    acumulado += d;
  }

  return trazado[trazado.length - 1];
}

function calcularHorario(horario, tiempoMin, referencia) {
  if (!horario) return null;
  const [h, m] = horario.split(":").map(Number);
  const salida = new Date(referencia);
  salida.setHours(h, m, 0, 0);
  const llegada = new Date(salida.getTime() + (tiempoMin ?? 0) * 60000);
  return { salida, llegada };
}

/**
 * Simula el recorrido del bus sobre el trazado de la ruta, usando el
 * horario programado y la duración estimada (tiempo_min). No hay GPS
 * real: se calcula qué tan avanzado "debería" ir el bus según la hora
 * actual.
 */
export default function useBusTracking(ticket) {
  const [ahora, setAhora] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setAhora(new Date()), 5000);
    return () => clearInterval(interval);
  }, []);

  if (!ticket || !ticket.horario) {
    return { estado: "sin_datos", mensaje: "No hay información del horario.", posicion: null, progreso: 0 };
  }

  const horarios = calcularHorario(ticket.horario, ticket.tiempo_min, ahora);
  if (!horarios) {
    return { estado: "sin_datos", mensaje: "No hay información del horario.", posicion: null, progreso: 0 };
  }

  const { salida, llegada } = horarios;
  const trazado = ticket.trazado ?? [];

  if (ahora < salida) {
    return {
      estado: "por_salir",
      mensaje: `El bus sale a las ${ticket.horario}`,
      posicion: trazado[0] ?? null,
      progreso: 0,
      salida,
      llegada,
    };
  }

  if (!ticket.tiempo_min || ahora >= llegada) {
    return {
      estado: "llegado",
      mensaje: "El bus ya llegó a su destino",
      posicion: trazado[trazado.length - 1] ?? null,
      progreso: 1,
      salida,
      llegada,
    };
  }

  const progreso = (ahora - salida) / (llegada - salida);
  const posicion = interpolarSobreTrazado(trazado, progreso);
  const minutosRestantes = Math.max(0, Math.round((llegada - ahora) / 60000));

  return {
    estado: "en_curso",
    mensaje:
      minutosRestantes > 0
        ? `En camino · llega en aprox. ${minutosRestantes} min`
        : "El bus está por llegar",
    posicion,
    progreso,
    salida,
    llegada,
  };
}