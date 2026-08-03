import { useState, useCallback } from "react";
import { routesService } from "../config/api";

export default function useRoutes() {
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [buscado, setBuscado] = useState(false);

  const buscar = useCallback(
    async ({
      provincia_origen,
      canton_origen,
      provincia_destino,
      canton_destino,
    } = {}) => {
      setLoading(true);
      setError(null);
      setBuscado(true);
      try {
        const params = {};
        if (provincia_origen) params.provincia_origen = provincia_origen;
        if (canton_origen) params.canton_origen = canton_origen;
        if (provincia_destino) params.provincia_destino = provincia_destino;
        if (canton_destino) params.canton_destino = canton_destino;

        const data = await routesService.getAll(params);
        setResultados(data);
      } catch (e) {
        setError(e.message);
        setResultados([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { resultados, buscar, loading, error, buscado };
}