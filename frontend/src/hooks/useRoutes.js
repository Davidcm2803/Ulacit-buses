import { useState, useCallback } from "react";
import { routesService } from "../config/api";

export default function useRoutes() {
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [buscado, setBuscado] = useState(false);

  const buscar = useCallback(async ({ origen, destino } = {}) => {
    setLoading(true);
    setError(null);
    setBuscado(true);
    try {
      const params = {};
      if (origen) params.origen = origen;
      if (destino) params.destino = destino;
      const data = await routesService.getAll(params);
      setResultados(data);
    } catch (e) {
      setError(e.message);
      setResultados([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { resultados, buscar, loading, error, buscado };
}