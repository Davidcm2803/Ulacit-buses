import { useState } from "react";
import { routesService } from "../config/api";

export default function useRutas() {
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);

  async function buscar({ origen, destino }) {
    setLoading(true);
    try {
      const todas = await routesService.getAll();
      const filtradas = todas.filter((ruta) => {
        const coincideOrigen = origen
          ? ruta.nombre.toLowerCase().includes(origen.toLowerCase())
          : true;
        const coincideDestino = destino
          ? ruta.nombre.toLowerCase().includes(destino.toLowerCase())
          : true;
        return coincideOrigen && coincideDestino;
      });
      setResultados(filtradas);
    } catch (e) {
      console.error("Error buscando rutas:", e);
    } finally {
      setLoading(false);
    }
  }

  return { resultados, loading, buscar };
}