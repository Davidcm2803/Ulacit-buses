import { useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import MapaRutas from "../components/routes/RouteMap";
import BuscadorRutas from "../components/routes/RouteSearch";
import { useDarkMode } from "../hooks/useDarkMode";
import useTrazadoRuta from "../hooks/useRouteLayout";
import { routesService } from "../config/api";

export default function Home() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [rutaDestacada, setRutaDestacada] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    routesService
      .getAll() 
      .then(async (data) => {
        if (data.length > 0) {
          const paradas = await routesService.getStops(data[0].id);
          console.log("ruta:", data[0]);
          console.log("paradas:", paradas);
          setRutaDestacada({ ...data[0], paradas });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const { coordenadas } = useTrazadoRuta(rutaDestacada?.paradas);

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-background transition-colors duration-300">
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Encuentra tu ruta de bus
            </h1>
            <p className="text-muted-foreground">
              Explora las rutas de transporte publico en Costa Rica
            </p>
          </div>

          <div className="mb-8">
            {loading && (
              <div className="flex h-[400px] items-center justify-center rounded-lg border border-border">
                <p className="text-muted-foreground">Cargando mapa...</p>
              </div>
            )}
            {!loading && rutaDestacada && (
              <MapaRutas
                coordenadasRecorrido={
                  coordenadas.length
                    ? coordenadas
                    : (rutaDestacada.trazado ?? [])
                }
                paradas={rutaDestacada.paradas ?? []}
              />
            )}
            {!loading && !rutaDestacada && (
              <div className="flex h-[400px] items-center justify-center rounded-lg border border-border">
                <p className="text-muted-foreground">
                  No hay rutas disponibles aún.
                </p>
              </div>
            )}
          </div>

          <BuscadorRutas />
        </main>
      </div>
    </div>
  );
}
