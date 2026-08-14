import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUp, Ticket } from "lucide-react";
import Navbar from "../components/layout/NavBar";
import MapaRutas from "../components/routes/RouteMap";
import BuscadorRutas from "../components/routes/RouteSearch";
import BuscadorCercano from "../components/routes/NearbySearch";
import { useDarkMode } from "../hooks/useDarkMode";
import useTrazadoRuta from "../hooks/useRouteLayout";
import { routesService } from "../config/api";

export default function Home() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const [rutaDestacada, setRutaDestacada] = useState(null);
  const [seleccionConfirmada, setSeleccionConfirmada] = useState(false);
  const [paradaSeleccionada, setParadaSeleccionada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rutasCercanas, setRutasCercanas] = useState([]);
  const [ubicacionUsuario, setUbicacionUsuario] = useState(null);
  const mapaRef = useRef(null);
  const resultadosRef = useRef(null);

  async function cargarRutaConParadas(ruta, { scroll = false, manual = false } = {}) {
    try {
      const paradas = ruta.paradas ?? (await routesService.getStops(ruta.id));
      setRutaDestacada({ ...ruta, paradas });
      setParadaSeleccionada(null);
      if (manual) setSeleccionConfirmada(true);
      if (scroll) {
        mapaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch (e) {
      console.error("No se pudieron cargar las paradas:", e);
    }
  }

  function volverAResultados() {
    resultadosRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleVerDetalles() {
    if (!seleccionConfirmada || !rutaDestacada) {
      alert("No hay ruta seleccionada. Elegí arriba a dónde querés ir.");
      volverAResultados();
      return;
    }
    navigate(`/rutas/${rutaDestacada.id}`);
  }

  useEffect(() => {
    routesService
      .getAll()
      .then(async (data) => {
        if (data.length > 0) await cargarRutaConParadas(data[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const { coordenadas } = useTrazadoRuta(rutaDestacada?.paradas);

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-background pb-20 transition-colors duration-300 md:pb-0">
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Encuentra tu ruta de bus
            </h1>
            <p className="text-muted-foreground">
              Explora las rutas de transporte público en Costa Rica
            </p>
          </div>

          <div className="mb-6">
            <BuscadorCercano
              onRutasCercanas={(rutas) => {
                setRutasCercanas(rutas);
                if (rutas.length > 0) cargarRutaConParadas(rutas[0], { scroll: true });
              }}
              onUbicacion={setUbicacionUsuario}
            />
            {rutasCercanas.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {rutasCercanas.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => cargarRutaConParadas(r, { scroll: true, manual: true })}
                    className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                      rutaDestacada?.id === r.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {r.nombre} · {r.parada_cercana} ({r.distancia_m} m)
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mb-8" ref={resultadosRef}>
            <BuscadorRutas
              onSelectRuta={(ruta, { auto } = {}) =>
                cargarRutaConParadas(ruta, { scroll: !auto, manual: true })
              }
              rutaSeleccionadaId={rutaDestacada?.id}
            />
          </div>

          <div className="mb-8" ref={mapaRef}>
            {loading && (
              <div className="flex h-[400px] items-center justify-center rounded-lg border border-border">
                <p className="text-muted-foreground">Cargando mapa...</p>
              </div>
            )}
            {!loading && rutaDestacada && (
              <>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold text-foreground">
                    Mostrando ruta: {rutaDestacada.nombre}
                    {!seleccionConfirmada && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        (sugerida)
                      </span>
                    )}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={volverAResultados}
                      className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <ArrowUp size={13} />
                      Volver a resultados
                    </button>
                    <button
                      type="button"
                      onClick={handleVerDetalles}
                      className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:opacity-90"
                    >
                      <Ticket size={13} />
                      Comprar Boleto
                    </button>
                  </div>
                </div>

                <MapaRutas
                  key={rutaDestacada.id}
                  coordenadasRecorrido={
                    coordenadas.length ? coordenadas : (rutaDestacada.trazado ?? [])
                  }
                  paradas={rutaDestacada.paradas ?? []}
                  onSelectParada={setParadaSeleccionada}
                  ubicacionUsuario={ubicacionUsuario}
                />
                <p className="mt-2 text-sm text-muted-foreground">
                  {rutaDestacada.canton_origen} → {rutaDestacada.canton_destino}
                  {paradaSeleccionada && (
                    <> · parada seleccionada: <span className="font-medium text-foreground">{paradaSeleccionada.nombre}</span></>
                  )}
                </p>
              </>
            )}
            {!loading && !rutaDestacada && (
              <div className="flex h-[400px] items-center justify-center rounded-lg border border-border">
                <p className="text-muted-foreground">No hay rutas disponibles aún.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}