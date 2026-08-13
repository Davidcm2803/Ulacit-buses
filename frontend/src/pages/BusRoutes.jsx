import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Bus, Clock, LocateFixed } from "lucide-react";
import Navbar from "../components/layout/NavBar";
import BuscadorRutas from "../components/routes/RouteSearch";
import { useDarkMode } from "../hooks/useDarkMode";
import { routesService } from "../config/api";
import { getListaProvincias } from "../lib/geoCR";

const RECIENTES_KEY = "rutas_recientes";
const MAX_RECIENTES = 4;

function cargarRecientes() {
  try {
    const raw = localStorage.getItem(RECIENTES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function guardarReciente(ruta) {
  try {
    const actuales = cargarRecientes().filter((r) => r.id !== ruta.id);
    const next = [{ id: ruta.id, nombre: ruta.nombre, codigo: ruta.codigo }, ...actuales].slice(
      0,
      MAX_RECIENTES,
    );
    localStorage.setItem(RECIENTES_KEY, JSON.stringify(next));
    return next;
  } catch {
    return cargarRecientes();
  }
}

function TarjetaRutaGrande({ ruta, distanciaKm, onClick }) {
  return (
    <Link
      to={`/rutas/${ruta.id}`}
      onClick={onClick}
      className="flex items-center gap-4 rounded-2xl border-2 border-border bg-card p-5 transition-colors hover:border-primary active:scale-[0.99]"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Bus size={26} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-bold text-foreground">{ruta.nombre}</p>
        <p className="truncate text-base text-muted-foreground">
          {ruta.canton_origen} → {ruta.canton_destino}
        </p>
        {typeof distanciaKm === "number" && (
          <p className="mt-1 text-sm font-medium text-primary">
            A {distanciaKm.toFixed(1)} km de ti
          </p>
        )}
      </div>
      <div className="shrink-0 text-right">
        <p className="text-lg font-bold text-foreground">₡{ruta.tarifa}</p>
        <p className="text-sm text-muted-foreground">por viaje</p>
      </div>
    </Link>
  );
}

export default function Rutas() {
  const { darkMode, toggleDarkMode } = useDarkMode();

  const [todasLasRutas, setTodasLasRutas] = useState([]);
  const [cargandoTodas, setCargandoTodas] = useState(true);

  const [provincias, setProvincias] = useState([]);
  const [provinciaActiva, setProvinciaActiva] = useState("");

  const [buscandoCerca, setBuscandoCerca] = useState(false);
  const [errorCerca, setErrorCerca] = useState("");
  const [rutasCerca, setRutasCerca] = useState(null);

  const [recientes, setRecientes] = useState(() => cargarRecientes());

  useEffect(() => {
    routesService
      .getAll()
      .then((data) => setTodasLasRutas(data.filter((r) => r.activa)))
      .catch(() => {})
      .finally(() => setCargandoTodas(false));

    getListaProvincias().then(setProvincias).catch(() => {});
  }, []);

  const rutasFiltradas = useMemo(() => {
    if (!provinciaActiva) return todasLasRutas;
    return todasLasRutas.filter(
      (r) => r.provincia_origen === provinciaActiva || r.provincia_destino === provinciaActiva,
    );
  }, [todasLasRutas, provinciaActiva]);

  function buscarCerca() {
    if (!navigator.geolocation) {
      setErrorCerca("Tu navegador no permite buscar tu ubicación.");
      return;
    }
    setBuscandoCerca(true);
    setErrorCerca("");
    setRutasCerca(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const cercanas = await routesService.getNearby(latitude, longitude, 5);
          setRutasCerca(cercanas);
        } catch {
          setErrorCerca("No se pudieron buscar rutas cercanas. Intenta de nuevo.");
        } finally {
          setBuscandoCerca(false);
        }
      },
      () => {
        setErrorCerca(
          "No pudimos acceder a tu ubicación. Revisa los permisos de ubicación en tu navegador.",
        );
        setBuscandoCerca(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function onVerRuta(ruta) {
    setRecientes(guardarReciente(ruta));
  }

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-background transition-colors duration-300">
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            ¿A dónde vas hoy?
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Buscá tu ruta de bus fácil y rápido.
          </p>

          <button
            onClick={buscarCerca}
            disabled={buscandoCerca}
            className="mb-4 flex w-full items-center gap-4 rounded-2xl bg-primary px-6 py-5 text-left text-primary-foreground shadow-sm transition-transform hover:brightness-105 active:scale-[0.99] disabled:opacity-70"
          >
            <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/15">
              {buscandoCerca && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/30" />
              )}
              <LocateFixed size={28} />
            </span>
            <span>
              <span className="block text-xl font-bold">
                {buscandoCerca ? "Buscando tu ubicación..." : "Ver rutas cerca de mí"}
              </span>
              <span className="block text-sm text-primary-foreground/80">
                Usa la ubicación para buscar la ruta más cercana
              </span>
            </span>
          </button>

          {errorCerca && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-base text-red-600 dark:bg-red-950/30 dark:text-red-400">
              {errorCerca}
            </div>
          )}

          {rutasCerca && (
            <div className="mb-8">
              <h2 className="mb-3 text-xl font-bold text-foreground">Rutas cerca de ti</h2>
              {rutasCerca.length === 0 ? (
                <p className="text-base text-muted-foreground">
                  No encontramos rutas cerca de tu ubicación.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {rutasCerca.map((r) => (
                    <TarjetaRutaGrande
                      key={r.id}
                      ruta={r}
                      distanciaKm={r.distancia_km}
                      onClick={() => onVerRuta(r)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mb-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm font-medium text-muted-foreground">o busca por nombre</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="mb-10">
            <BuscadorRutas />
          </div>

          {recientes.length > 0 && (
            <div className="mb-10">
              <h2 className="mb-3 text-xl font-bold text-foreground">Vistos recientemente</h2>
              <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {recientes.map((r) => (
                  <Link
                    key={r.id}
                    to={`/rutas/${r.id}`}
                    className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-base font-medium text-foreground hover:border-primary"
                  >
                    <Clock size={15} className="text-muted-foreground" />
                    {r.nombre}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {provincias.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-xl font-bold text-foreground">Provincia</h2>
              <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <button
                  onClick={() => setProvinciaActiva("")}
                  className={`shrink-0 rounded-full border-2 px-4 py-2.5 text-base font-medium transition-colors ${
                    provinciaActiva === ""
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-foreground hover:bg-muted"
                  }`}
                >
                  Todas
                </button>
                {provincias.map((p) => (
                  <button
                    key={p}
                    onClick={() => setProvinciaActiva(p)}
                    className={`shrink-0 rounded-full border-2 px-4 py-2.5 text-base font-medium transition-colors ${
                      provinciaActiva === p
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="mb-3 text-xl font-bold text-foreground">Todas las rutas disponibles</h2>

            {cargandoTodas && <p className="text-base text-muted-foreground">Cargando rutas...</p>}

            {!cargandoTodas && rutasFiltradas.length === 0 && (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-10 text-center">
                <Search size={28} className="text-muted-foreground" />
                <p className="text-base text-muted-foreground">
                  No hay rutas para esta provincia.
                </p>
              </div>
            )}

            {!cargandoTodas && rutasFiltradas.length > 0 && (
              <div className="flex flex-col gap-3">
                {rutasFiltradas.map((r) => (
                  <TarjetaRutaGrande key={r.id} ruta={r} onClick={() => onVerRuta(r)} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}