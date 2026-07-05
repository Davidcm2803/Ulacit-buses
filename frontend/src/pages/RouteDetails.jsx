import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Users, ShoppingCart } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import MapaRutas from "../components/routes/RouteMap";
import ListaParadas from "../components/routes/StopList";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import SelectField from "../components/ui/SelectField";
import useTrazadoRuta from "../hooks/useRouteLayout";
import { useDarkMode } from "../hooks/useDarkMode";
import { routesService } from "../config/api";
import { useCart } from "../context/CartContext";

function generarHorarios(primerBus, ultimoBus, frecuencia) {
  if (!primerBus || !ultimoBus || !frecuencia) return [];
  const [h1, m1] = primerBus.split(":").map(Number);
  const [h2, m2] = ultimoBus.split(":").map(Number);
  let actual = h1 * 60 + m1;
  const fin = h2 * 60 + m2;
  const horarios = [];
  while (actual <= fin) {
    const h = String(Math.floor(actual / 60)).padStart(2, "0");
    const m = String(actual % 60).padStart(2, "0");
    horarios.push(`${h}:${m}`);
    actual += Number(frecuencia);
  }
  return horarios;
}

export default function DetalleRuta() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { item: carritoActual, addToCart } = useCart();

  const [ruta, setRuta] = useState(null);
  const [paradas, setParadas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [paradaId, setParadaId] = useState("");
  const [horario, setHorario] = useState("");
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    setLoading(true);
    setRuta(null);
    Promise.all([routesService.getById(id), routesService.getStops(id)])
      .then(([rutaData, paradasData]) => {
        setRuta(rutaData);
        setParadas(paradasData);
        const abordables = paradasData.filter((p) => p.tipo !== "destino");
        if (abordables.length) setParadaId(abordables[0].id);
      })
      .catch(() => setRuta(null))
      .finally(() => setLoading(false));
  }, [id]);

  const { coordenadas } = useTrazadoRuta(paradas);

  const horarios = useMemo(
    () =>
      ruta
        ? generarHorarios(ruta.primer_bus, ruta.ultimo_bus, ruta.frecuencia)
        : [],
    [ruta],
  );

  useEffect(() => {
    if (horarios.length && !horario) setHorario(horarios[0]);
  }, [horarios, horario]);

  const total = ruta ? ruta.tarifa * cantidad : 0;

  function handleAgregar() {
    if (!ruta || !paradaId || !horario) return;
    const parada = paradas.find((p) => p.id === paradaId);
    const agregado = addToCart({
      rutaId: ruta.id,
      rutaNombre: ruta.nombre,
      rutaCodigo: ruta.codigo,
      tarifa: ruta.tarifa,
      paradaId: parada.id,
      paradaNombre: parada.nombre,
      horario,
      cantidad,
    });
    if (agregado) navigate("/carrito");
  }

  if (loading) {
    return (
      <div className={darkMode ? "dark" : ""}>
        <div className="min-h-screen bg-background">
          <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <p className="text-muted-foreground">Cargando ruta...</p>
          </main>
        </div>
      </div>
    );
  }

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

  const abordables = paradas.filter((p) => p.tipo !== "destino");

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-background transition-colors duration-300">
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="mb-1 text-2xl font-bold tracking-tight sm:text-3xl">
              {ruta.codigo} - {ruta.nombre}
            </h1>
            <p className="text-muted-foreground">
              {ruta.primer_bus} - {ruta.ultimo_bus} &middot; {"\u20A1"}
              {ruta.tarifa.toLocaleString()} por persona
            </p>
          </div>

          <div className="mb-6">
            <MapaRutas
              coordenadasRecorrido={
                coordenadas.length ? coordenadas : ruta.trazado
              }
              paradas={paradas}
              onSelectParada={(p) => p.tipo !== "destino" && setParadaId(p.id)}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <h2 className="mb-4 text-lg font-semibold">Paradas</h2>
              <ListaParadas paradas={paradas} />
            </Card>

            <Card>
              <h2 className="mb-6 text-lg font-semibold text-foreground">
                Comprar boleto
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  label="Tu parada (o haz click en el mapa)"
                  value={paradas.find((p) => p.id === paradaId)?.nombre ?? ""}
                  onChange={(nombreSeleccionado) => {
                    const p = abordables.find(
                      (p) => p.nombre === nombreSeleccionado,
                    );
                    if (p) setParadaId(p.id);
                  }}
                  options={abordables.map((p) => p.nombre)}
                />
                <SelectField
                  label="Horario de salida"
                  value={horario}
                  onChange={setHorario}
                  options={horarios}
                />
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Cantidad de personas
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground hover:bg-muted"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-medium text-foreground">
                    {cantidad}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCantidad((c) => Math.min(10, c + 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground hover:bg-muted"
                  >
                    +
                  </button>
                  <Users size={16} className="ml-2 text-muted-foreground" />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-primary">
                    ₡{total.toLocaleString()}
                  </p>
                </div>
                <Button
                  onClick={handleAgregar}
                  disabled={!paradaId || !horario}
                >
                  <ShoppingCart size={16} />
                  Agregar al carrito
                </Button>
              </div>

              {carritoActual && carritoActual.rutaId !== ruta.id && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Ya tienes un boleto de "{carritoActual.rutaNombre}" en el
                  carrito. Agregar este lo reemplazará.
                </p>
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
