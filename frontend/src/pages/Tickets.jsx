import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bus, MapPin, Clock, Users, Ticket as TicketIcon } from "lucide-react";
import Navbar from "../components/layout/NavBar";
import Card from "../components/ui/Card";
import { useDarkMode } from "../hooks/useDarkMode";
import { ticketsService } from "../config/api";

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
            <div className="flex flex-col gap-4">
              {tickets.map((t) => (
                <Link key={t.id} to={`/tickets/${t.id}`}>
                  <Card className="transition-colors hover:border-primary/50">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                          <Bus size={15} />
                        </div>
                        <span className="font-semibold text-foreground">
                          {t.ruta_nombre}
                        </span>
                      </div>
                      <EstadoBadge estado={t.estado} />
                    </div>

                    <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} />
                        <span>{t.parada_nombre}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>Horario: {t.horario}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={14} />
                        <span>{t.cantidad} persona{t.cantidad !== 1 && "s"}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                      <span className="text-xs text-muted-foreground">
                        Comprado el{" "}
                        {new Date(t.createdAt).toLocaleDateString("es-CR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="text-sm font-semibold text-primary">
                        ₡{t.monto.toLocaleString()}
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}