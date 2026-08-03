import { useEffect, useRef, useState } from "react";
import { Search, LocateFixed, Loader2, X, MapPin, Clock } from "lucide-react";
import Card from "../ui/Card";
import { buscarDireccion } from "../../lib/geocode";
import { routesService } from "../../config/api";

const RECIENTES_KEY = "506tracker_busquedas_recientes";
const MAX_RECIENTES = 5;

function cargarRecientes() {
  try {
    return JSON.parse(localStorage.getItem(RECIENTES_KEY)) ?? [];
  } catch {
    return [];
  }
}

function guardarReciente(item) {
  const actuales = cargarRecientes().filter((r) => r.label !== item.label);
  const nuevas = [item, ...actuales].slice(0, MAX_RECIENTES);
  localStorage.setItem(RECIENTES_KEY, JSON.stringify(nuevas));
  return nuevas;
}

export default function BuscadorCercano({ onRutasCercanas, onUbicacion }) {
  const [query, setQuery] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [recientes, setRecientes] = useState([]);
  const [mostrarPanel, setMostrarPanel] = useState(false);
  const [indiceActivo, setIndiceActivo] = useState(-1);
  const [loadingSugerencias, setLoadingSugerencias] = useState(false);
  const [loadingBusqueda, setLoadingBusqueda] = useState(false);
  const [buscandoUbicacion, setBuscandoUbicacion] = useState(false);
  const [error, setError] = useState(null);

  const debounceRef = useRef(null);
  const contenedorRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setRecientes(cargarRecientes());
  }, []);

  useEffect(() => {
    function handleClickFuera(e) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target)) {
        setMostrarPanel(false);
        setIndiceActivo(-1);
      }
    }
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  const listaVisible = query.trim().length >= 3 ? sugerencias : recientes;

  async function buscarCercaDe(lat, lng) {
    setLoadingBusqueda(true);
    setError(null);
    try {
      const rutas = await routesService.getNearby(lat, lng);
      onRutasCercanas?.(rutas);
      onUbicacion?.({ lat, lng });
      if (rutas.length === 0) {
        setError("No encontramos rutas cerca de ese punto. Probá aumentando el radio o buscá otra dirección.");
      }
    } catch (e) {
      setError("No se pudieron cargar rutas cercanas: " + e.message);
    } finally {
      setLoadingBusqueda(false);
    }
  }

  function usarMiUbicacion() {
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización.");
      return;
    }
    setBuscandoUbicacion(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBuscandoUbicacion(false);
        setQuery("Mi ubicación actual");
        setMostrarPanel(false);
        buscarCercaDe(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setBuscandoUbicacion(false);
        const mensaje =
          err.code === err.PERMISSION_DENIED
            ? "Bloqueaste el permiso de ubicación. Habilítalo en la configuración del navegador."
            : "No pudimos obtener tu ubicación. Intenta de nuevo o escribe una dirección.";
        setError(mensaje);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function handleChange(e) {
    const value = e.target.value;
    setQuery(value);
    setIndiceActivo(-1);
    setMostrarPanel(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 3) {
      setSugerencias([]);
      setLoadingSugerencias(false);
      return;
    }

    setLoadingSugerencias(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const resultados = await buscarDireccion(value);
        setSugerencias(resultados);
      } catch {
        setSugerencias([]);
      } finally {
        setLoadingSugerencias(false);
      }
    }, 500);
  }

  function seleccionarSugerencia(s) {
    setQuery(s.label);
    setSugerencias([]);
    setMostrarPanel(false);
    setIndiceActivo(-1);
    setRecientes(guardarReciente(s));
    buscarCercaDe(s.lat, s.lng);
    inputRef.current?.blur();
  }

  function limpiarQuery() {
    setQuery("");
    setSugerencias([]);
    setIndiceActivo(-1);
    inputRef.current?.focus();
  }

  function handleKeyDown(e) {
    if (!mostrarPanel || listaVisible.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndiceActivo((i) => (i + 1) % listaVisible.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndiceActivo((i) => (i - 1 + listaVisible.length) % listaVisible.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const elegido = indiceActivo >= 0 ? listaVisible[indiceActivo] : listaVisible[0];
      if (elegido) seleccionarSugerencia(elegido);
    } else if (e.key === "Escape") {
      setMostrarPanel(false);
      setIndiceActivo(-1);
      inputRef.current?.blur();
    }
  }

  const cargando = loadingSugerencias || loadingBusqueda;

  return (
    <Card className="relative" ref={contenedorRef}>
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
        <Search size={18} className="text-primary" />
        ¿A dónde vamos hoy?
      </h2>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />

          <input
            ref={inputRef}
            value={query}
            onChange={handleChange}
            onFocus={() => setMostrarPanel(true)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe una dirección, ej. Mall San Pedro"
            role="combobox"
            aria-expanded={mostrarPanel}
            aria-autocomplete="list"
            className="h-11 w-full rounded-md border border-border bg-background pl-9 pr-9 text-sm text-foreground outline-none transition-colors focus:border-primary"
          />

          {loadingSugerencias && (
            <Loader2
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground"
            />
          )}

          {!loadingSugerencias && query && (
            <button
              type="button"
              onClick={limpiarQuery}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Limpiar búsqueda"
            >
              <X size={15} />
            </button>
          )}

          {mostrarPanel && listaVisible.length > 0 && (
            <ul className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-lg border border-border bg-background shadow-lg">
              {query.trim().length < 3 && (
                <li className="flex items-center gap-1.5 px-3 pt-2.5 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  <Clock size={11} />
                  Búsquedas recientes
                </li>
              )}
              <div className="max-h-64 overflow-y-auto">
                {listaVisible.map((s, i) => (
                  <li
                    key={`${s.label}-${i}`}
                    onMouseDown={() => seleccionarSugerencia(s)}
                    onMouseEnter={() => setIndiceActivo(i)}
                    className={`flex cursor-pointer items-start gap-2 px-3 py-2.5 text-sm transition-colors ${
                      indiceActivo === i ? "bg-muted" : ""
                    }`}
                  >
                    <MapPin size={15} className="mt-0.5 shrink-0 text-muted-foreground" />
                    <span className="text-foreground">{s.label}</span>
                  </li>
                ))}
              </div>
            </ul>
          )}

          {mostrarPanel && query.trim().length > 0 && query.trim().length < 3 && (
            <div className="absolute z-20 mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-xs text-muted-foreground shadow-lg">
              Escribe al menos 3 letras para buscar
            </div>
          )}

          {mostrarPanel &&
            query.trim().length >= 3 &&
            !loadingSugerencias &&
            sugerencias.length === 0 && (
              <div className="absolute z-20 mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-xs text-muted-foreground shadow-lg">
                No encontramos esa dirección
              </div>
            )}
        </div>

        <button
          type="button"
          onClick={usarMiUbicacion}
          disabled={buscandoUbicacion}
          className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm text-foreground transition-colors hover:bg-muted disabled:opacity-60"
        >
          {buscandoUbicacion ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <LocateFixed size={16} />
          )}
          Usar mi ubicación
        </button>
      </div>

      {loadingBusqueda && (
        <p className="mt-3 text-xs text-muted-foreground">Buscando rutas cercanas...</p>
      )}
      {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
    </Card>
  );
}