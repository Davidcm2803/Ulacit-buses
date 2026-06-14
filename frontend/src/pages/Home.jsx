import Navbar from "../components/layout/Navbar";
import MapaRutas from "../components/routes/RouteMap";
import BuscadorRutas from "../components/routes/RouteSearch";
import { useDarkMode } from "../hooks/useDarkMode";
import { getRutaPorId } from "../lib/routesData";
import useTrazadoRuta from "../hooks/useRouteLayout";

export default function Home() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const rutaDestacada = getRutaPorId("101");
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
            <MapaRutas
              coordenadasRecorrido={coordenadas.length ? coordenadas : rutaDestacada.paradas}
              paradas={rutaDestacada.paradas}
            />
          </div>

          <BuscadorRutas />
        </main>
      </div>
    </div>
  );
}