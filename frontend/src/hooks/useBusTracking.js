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

function formatSalidaCompleta(fecha) {
  const hora = fecha
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/Costa_Rica",
    })
    .toUpperCase();

  const dia = fecha.toLocaleDateString("es-CR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "America/Costa_Rica",
  });

  return `El bus sale a las ${hora} el ${dia}`;
}

export default function useBusTracking(ticket) {
  const [ahora, setAhora] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setAhora(new Date()), 5000);
    return () => clearInterval(interval);
  }, []);

  if (!ticket || !ticket.salida_at) {
    return { estado: "sin_datos", mensaje: "No hay información del horario.", posicion: null, progreso: 0 };
  }

  const salida = new Date(ticket.salida_at);
  const llegada = ticket.tiempo_min
    ? new Date(salida.getTime() + ticket.tiempo_min * 60000)
    : null;

  const trazado = ticket.trazado ?? [];

  if (ahora < salida) {
    return {
      estado: "por_salir",
      mensaje: formatSalidaCompleta(salida),
      posicion: trazado[0] ?? null,
      progreso: 0,
      salida,
      llegada,
    };
  }

  if (!llegada || ahora >= llegada) {
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