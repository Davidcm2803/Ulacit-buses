export const rutas = [
  {
    id: "101",
    numero: "101",
    nombre: "San Luis Heredia → San José",
    origen: "San Luis",
    destino: "San José",
    horaSalida: "06:00",
    precio: 520,
    paradas: [
      {
        nombre: "Las Juntas San Luis",
        lat: 10.01363197238127,
        lng: -84.02671363937814,
      },
      {
        nombre: "Edificio Herdocia",
        lat: 9.935914545265598,
        lng: -84.07982783255653,
      },
    ],
    coordenadas_recorrido: [],
  },
];

export function getRutaPorId(id) {
  return rutas.find((r) => r.id === id);
}