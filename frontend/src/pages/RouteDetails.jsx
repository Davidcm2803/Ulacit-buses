import { useParams, Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import MapaRutas from "../components/routes/RouteMap";
import ListaParadas from "../components/routes/StopList";
import Card from "../components/ui/Card";
import useTrazadoRuta from "../hooks/useRouteLayout";
import { getRutaPorId } from "../lib/routesData";
import { useDarkMode } from "../hooks/useDarkMode";

export default function DetalleRuta() {
  const { id } = useParams();
  const ruta = getRutaPorId(id);
  const { coordenadas } = useTrazadoRuta(ruta?.paradas);
  const { darkMode, toggleDarkMode } = useDarkMode();

  if (!ruta) {
    return (
      <div className={darkMode ? "dark" : ""}>
        <div className="min-h-screen bg-background">
          <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <p className="mb-2">Ruta no encontrada.</p>
            <Link to="/rutas" className="text-primary hover:underline">
              Volver a rutas
            </Link>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-background transition-colors duration-300">
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="mb-1 text-2xl font-bold tracking-tight sm:text-3xl">
              {ruta.numero} - {ruta.nombre}
            </h1>
            <p className="text-muted-foreground">
              Salida: {ruta.horaSalida} &middot; {"\u20A1"}
              {ruta.precio.toLocaleString()} por persona
            </p>
          </div>
          <div className="mb-6">
            <MapaRutas
              coordenadasRecorrido={coordenadas.length ? coordenadas : ruta.paradas}
              paradas={ruta.paradas}
            />
          </div>
          <Card>
            <h2 className="mb-4 text-lg font-semibold">Paradas</h2>
            <ListaParadas paradas={ruta.paradas} />
          </Card>
        </main>
      </div>
    </div>
  );
}