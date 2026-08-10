import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bus, MapPin, Clock, Users, Ticket as TicketIcon, CheckCircle2 } from "lucide-react";
import Navbar from "../components/layout/NavBar";
import Card from "../components/ui/Card";
import { useDarkMode } from "../hooks/useDarkMode";
import { ticketsService } from "../config/api";
import { labelEstadoViaje, esViajeFinalizado } from "../lib/ticketTracking";

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

export default function Tickets() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    ticketsService
      .getMine()
      .then(setTickets)
      .catch((e) => setError(e.message || "No se pudieron cargar tus tickets."))
      .finally(() => setLoading(false));
  }, []);

  const { activos, finalizados } = useMemo(() => {
    const activos = [];
    const finalizados = [];
    for (const t of tickets) {
      if (esViajeFinalizado(t)) finalizados.push(t);
      else activos.push(t);
    }
    return { activos, finalizados };
  }, [tickets]);

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
            <div className="flex flex-col gap-8">
              <section>
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  <Bus size={14} />
                  Viajes activos ({activos.length})
                </h2>
                {activos.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tenés viajes activos.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {activos.map((t) => (
                      <TarjetaTicket key={t.id} ticket={t} />
                    ))}
                  </div>
                )}
              </section>

              {finalizados.length > 0 && (
                <section>
                  <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    <CheckCircle2 size={14} />
                    Viajes finalizados ({finalizados.length})
                  </h2>
                  <div className="flex flex-col gap-4">
                    {finalizados.map((t) => (
                      <TarjetaTicket key={t.id} ticket={t} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}