import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bus,
  MapPin,
  Clock,
  Users,
  Ticket as TicketIcon,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Calendar,
} from "lucide-react";
import Navbar from "../components/layout/NavBar";
import Card from "../components/ui/Card";
import { useDarkMode } from "../hooks/useDarkMode";
import { ticketsService } from "../config/api";
import { labelEstadoViaje, esViajeFinalizado } from "../lib/ticketTracking";
import { cn } from "../lib/utils";

function EstadoBadge({ estado }) {
  const map = {
    activo: { label: "Activo", cls: "bg-primary/10 text-primary" },
    usado: { label: "Usado", cls: "bg-muted text-muted-foreground" },
    cancelado: { label: "Cancelado", cls: "bg-red-500/10 text-red-500" },
  };
  const { label, cls } = map[estado] ?? { label: estado, cls: "bg-muted text-muted-foreground" };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

function ViajeBadge({ estadoViaje }) {
  const map = {
    por_salir: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    en_curso: "bg-primary/10 text-primary",
    finalizado: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    sin_datos: "bg-muted text-muted-foreground",
  };
  const cls = map[estadoViaje] ?? map.sin_datos;
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}>
      {labelEstadoViaje(estadoViaje)}
    </span>
  );
}

function TarjetaTicket({ ticket }) {
  return (
    <Link to={`/tickets/${ticket.id}`}>
      <Card className="transition-colors hover:border-primary/50">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Bus size={15} />
            </div>
            <span className="font-semibold text-foreground">{ticket.ruta_nombre}</span>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <EstadoBadge estado={ticket.estado} />
            <ViajeBadge estadoViaje={ticket.estado_viaje} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin size={14} />
            <span>{ticket.parada_nombre}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} />
            <span>Horario: {ticket.horario}</span>
          </div>
          {formatFechaSalida(ticket) && (
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              <span>{formatFechaSalida(ticket)}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users size={14} />
            <span>{ticket.cantidad} persona{ticket.cantidad !== 1 && "s"}</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs text-muted-foreground">
            Comprado el{" "}
            {new Date(ticket.createdAt).toLocaleDateString("es-CR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          <span className="text-sm font-semibold text-primary">
            ₡{ticket.monto.toLocaleString()}
          </span>
        </div>
      </Card>
    </Link>
  );
}

function formatFechaSalida(ticket) {
  if (!ticket.salida_at) return null;

  const fecha = new Date(ticket.salida_at);

  const dia = fecha.toLocaleDateString("es-CR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "America/Costa_Rica",
  });

  return dia.charAt(0).toUpperCase() + dia.slice(1);
}

function claveDiaCR(fecha) {
  return new Date(fecha).toLocaleDateString("en-CA", {
    timeZone: "America/Costa_Rica",
  });
}

function claveDia(ticket) {
  const fecha = ticket.salida_at || ticket.fecha || ticket.createdAt;
  if (!fecha) return "sin-fecha";
  return claveDiaCR(fecha);
}

function hoyClaveCR() {
  return claveDiaCR(new Date());
}

function partesDia(clave) {
  if (clave === "sin-fecha") return { diaSemana: "?", diaNumero: "?", mes: "" };
  const [y, m, d] = clave.split("-").map(Number);
  const fecha = new Date(y, m - 1, d);
  return {
    fecha,
    diaSemana: fecha.toLocaleDateString("es-CR", { weekday: "short" }).replace(".", ""),
    diaNumero: fecha.getDate(),
    mes: fecha.toLocaleDateString("es-CR", { month: "short" }).replace(".", ""),
  };
}

function etiquetaDia(clave, hoy) {
  if (clave === "sin-fecha") return "S/F";
  const diffMs = new Date(clave) - new Date(hoy);
  const diffDias = Math.round(diffMs / 86400000);
  if (diffDias === 0) return "Hoy";
  if (diffDias === 1) return "Mañana";
  if (diffDias === -1) return "Ayer";
  return partesDia(clave).diaSemana;
}

function labelDiaCompleto(clave) {
  if (clave === "sin-fecha") return "Fecha desconocida";
  const { fecha } = partesDia(clave);
  const label = fecha.toLocaleDateString("es-CR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function SelectorDiaTickets({ dias, value, onChange }) {
  const scrollRef = useRef(null);
  const arrastrando = useRef(false);
  const inicioX = useRef(0);
  const inicioScroll = useRef(0);
  const seMovio = useRef(false);
  const hoy = hoyClaveCR();

  function desplazar(direccion) {
    scrollRef.current?.scrollBy({ left: direccion * 160, behavior: "smooth" });
  }

  function onPointerDown(e) {
    arrastrando.current = true;
    seMovio.current = false;
    inicioX.current = e.clientX;
    inicioScroll.current = scrollRef.current.scrollLeft;
  }

  function onPointerMove(e) {
    if (!arrastrando.current) return;
    const delta = e.clientX - inicioX.current;
    if (Math.abs(delta) > 4) seMovio.current = true;
    scrollRef.current.scrollLeft = inicioScroll.current - delta;
  }

  function onPointerUp() {
    arrastrando.current = false;
  }

  function onClickCapture(e) {
    if (seMovio.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  return (
    <div className="relative mb-6 flex items-center gap-1">
      <button
        type="button"
        onClick={() => desplazar(-1)}
        className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted sm:flex"
        aria-label="Ver días anteriores"
      >
        <ChevronLeft size={16} />
      </button>

      <div className="relative min-w-0 flex-1">
        <div
          ref={scrollRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onClickCapture={onClickCapture}
          className="flex cursor-grab gap-2 overflow-x-auto pb-1 pr-8 active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <button
            type="button"
            onClick={() => onChange(null)}
            className={cn(
              "flex w-14 shrink-0 flex-col items-center justify-center rounded-lg border px-2 py-2 transition-colors",
              value === null
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-foreground hover:bg-muted",
            )}
          >
            <span className="text-[11px] font-medium">Todos</span>
          </button>

          {dias.map((clave) => {
            const { diaNumero, mes } = partesDia(clave);
            const activo = value === clave;
            const esHoy = clave === hoy;
            return (
              <button
                key={clave}
                type="button"
                onClick={() => onChange(clave)}
                className={cn(
                  "flex w-14 shrink-0 flex-col items-center rounded-lg border px-2 py-2 transition-colors",
                  activo && esHoy && "border-green-600 bg-green-600 text-white",
                  activo && !esHoy && "border-primary bg-primary text-primary-foreground",
                  !activo && esHoy && "border-green-600 text-green-600 hover:bg-green-600/10",
                  !activo && !esHoy && "border-border text-foreground hover:bg-muted",
                )}
              >
                <span
                  className={cn(
                    "text-[11px] capitalize",
                    activo ? "text-current opacity-80" : esHoy ? "text-green-600" : "text-muted-foreground",
                  )}
                >
                  {etiquetaDia(clave, hoy)}
                </span>
                <span className="text-lg font-bold leading-tight">{diaNumero}</span>
                <span
                  className={cn(
                    "text-[10px] capitalize",
                    activo ? "text-current opacity-80" : esHoy ? "text-green-600" : "text-muted-foreground",
                  )}
                >
                  {mes}
                </span>
              </button>
            );
          })}
        </div>

        <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-background to-transparent" />
      </div>

      <button
        type="button"
        onClick={() => desplazar(1)}
        className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted sm:flex"
        aria-label="Ver días siguientes"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

export default function Tickets() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("activos");
  const [diasAbiertos, setDiasAbiertos] = useState(() => new Set());
  const [diaSeleccionado, setDiaSeleccionado] = useState(() => hoyClaveCR());

  useEffect(() => {
    ticketsService
      .getMine()
      .then(setTickets)
      .catch((e) => setError(e.message || "No se pudieron cargar tus tickets."))
      .finally(() => setLoading(false));
  }, []);

  const diasDisponibles = useMemo(() => {
    const hoy = hoyClaveCR();
    const set = new Set(tickets.map(claveDia));
    set.add(hoy);
    set.delete("sin-fecha");
    return Array.from(set).sort();
  }, [tickets]);

  const ticketsDelDia = useMemo(() => {
    if (diaSeleccionado === null) return tickets;
    return tickets.filter((t) => claveDia(t) === diaSeleccionado);
  }, [tickets, diaSeleccionado]);

  const { activos, finalizados } = useMemo(() => {
    const activos = [];
    const finalizados = [];
    for (const t of ticketsDelDia) {
      if (esViajeFinalizado(t)) finalizados.push(t);
      else activos.push(t);
    }
    return { activos, finalizados };
  }, [ticketsDelDia]);

  const gruposFinalizados = useMemo(() => {
    if (diaSeleccionado !== null) return null;
    const map = new Map();
    for (const t of finalizados) {
      const clave = claveDia(t);
      if (!map.has(clave)) map.set(clave, []);
      map.get(clave).push(t);
    }
    return Array.from(map.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([clave, tickets]) => ({ clave, label: labelDiaCompleto(clave), tickets }));
  }, [finalizados, diaSeleccionado]);

  function toggleDia(clave) {
    setDiasAbiertos((prev) => {
      const next = new Set(prev);
      if (next.has(clave)) next.delete(clave);
      else next.add(clave);
      return next;
    });
  }

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-background transition-colors duration-300">
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="mb-6 text-2xl font-bold text-foreground sm:text-3xl">
            Mis tickets
          </h1>

          {loading && (
            <div className="flex h-[200px] items-center justify-center rounded-lg border border-border">
              <p className="text-muted-foreground">Cargando tickets...</p>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:bg-red-950/30">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {!loading && !error && tickets.length === 0 && (
            <div className="flex h-[300px] flex-col items-center justify-center gap-3 rounded-lg border border-border">
              <TicketIcon size={28} className="text-muted-foreground" />
              <p className="text-muted-foreground">Todavía no tienes tickets.</p>
              <Link to="/rutas" className="text-sm text-primary hover:underline">
                Buscar una ruta
              </Link>
            </div>
          )}

          {!loading && !error && tickets.length > 0 && (
            <>
              <SelectorDiaTickets
                dias={diasDisponibles}
                value={diaSeleccionado}
                onChange={setDiaSeleccionado}
              />

              <div className="mb-6 flex border-b border-border">
                <button
                  onClick={() => setTab("activos")}
                  className={cn(
                    "flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                    tab === "activos"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Bus size={14} />
                  Activos ({activos.length})
                </button>
                <button
                  onClick={() => setTab("finalizados")}
                  className={cn(
                    "flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                    tab === "finalizados"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  <CheckCircle2 size={14} />
                  Finalizados ({finalizados.length})
                </button>
              </div>

              {tab === "activos" && (
                activos.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No tenés viajes activos {diaSeleccionado === null ? "" : "para este día"}.
                  </p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {activos.map((t) => (
                      <TarjetaTicket key={t.id} ticket={t} />
                    ))}
                  </div>
                )
              )}

              {tab === "finalizados" && (
                diaSeleccionado !== null ? (
                  finalizados.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No tenés viajes finalizados para este día.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {finalizados.map((t) => (
                        <TarjetaTicket key={t.id} ticket={t} />
                      ))}
                    </div>
                  )
                ) : gruposFinalizados.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tenés viajes finalizados.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {gruposFinalizados.map((grupo) => {
                      const abierto = diasAbiertos.has(grupo.clave);
                      return (
                        <div
                          key={grupo.clave}
                          className="overflow-hidden rounded-lg border border-border"
                        >
                          <button
                            onClick={() => toggleDia(grupo.clave)}
                            className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/50"
                          >
                            <span className="text-sm font-medium text-foreground">
                              {grupo.label}
                            </span>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <span className="text-xs">
                                {grupo.tickets.length} viaje{grupo.tickets.length !== 1 && "s"}
                              </span>
                              {abierto ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </div>
                          </button>
                          {abierto && (
                            <div className="flex flex-col gap-3 border-t border-border bg-muted/20 p-3">
                              {grupo.tickets.map((t) => (
                                <TarjetaTicket key={t.id} ticket={t} />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}