import { useState } from "react";
import { rutas } from "../lib/routesData";

/**
 * Hook de busqueda de rutas. De momento usa datos hardcodeados;
 * cuando el backend este listo, reemplazar el cuerpo de buscar()
 * por una llamada a la API usando fetch o axios desde el back.
 */
export default function useRutas() {
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);

  function buscar({ origen, destino }) {
    setLoading(true);

    const filtradas = rutas.filter((ruta) => {
      const coincideOrigen = origen
        ? ruta.origen.toLowerCase().includes(origen.toLowerCase())
        : true;
      const coincideDestino = destino
        ? ruta.destino.toLowerCase().includes(destino.toLowerCase())
        : true;
      return coincideOrigen && coincideDestino;
    });

    setResultados(filtradas);
    setLoading(false);
  }

  return { resultados, loading, buscar };
}
