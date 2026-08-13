const ESTADO_LABELS = {
  por_salir: "Por salir",
  en_curso: "En camino",
  finalizado: "Finalizado",
  sin_datos: "Sin datos",
};

export function labelEstadoViaje(estadoViaje) {
  return ESTADO_LABELS[estadoViaje] ?? ESTADO_LABELS.sin_datos;
}

export function esViajeFinalizado(ticket) {
  return ticket.estado_viaje === "finalizado";
}