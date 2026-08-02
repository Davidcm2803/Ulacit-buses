import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Users, Bus } from "lucide-react";
import Navbar from "../components/layout/NavBar";
import MapaRutas from "../components/routes/RouteMap";
import Card from "../components/ui/Card";
import { useDarkMode } from "../hooks/useDarkMode";
import { ticketsService } from "../config/api";
import useBusTracking from "../hooks/useBusTracking";

const ESTADO_STYLES = {
  por_salir: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  en_curso: "bg-primary/10 text-primary",
  llegado: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  sin_datos: "bg-muted text-muted-foreground",
};

export default function TicketDetail() {
  const { id } = useParams();
  const { darkMode, toggleDarkMode } = useDarkMode();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    ticketsService
      .getById(id)
      .then(setTicket)
      .catch((e) => setError(e.message || "No se pudo cargar el ticket."))
      .finally(() => setLoading(false));
  }, [id]);

  const tracking = useBusTracking(ticket);

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-background transition-colors duration-300">
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            to="/tickets"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={15} />
            Mis tickets
          </Link>

          {loading && (
            <div className="flex h-[300px] items-center justify-center rounded-lg border border-border">
              <p className="text-muted-foreground">Cargando ticket...</p>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:bg-red-950/30">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {!loading && ticket && (
            <>
              <Card className="mb-6">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                      <Bus size={16} />
                    </div>
                    <span className="text-lg font-semibold text-foreground">
                      {ticket.ruta_nombre}
                    </span>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1.5 text-sm font-medium ${ESTADO_STYLES[tracking.estado]}`}
                  >
                    {tracking.mensaje}
                  </span>
                </div>

                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    <span>{ticket.parada_nombre}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>Salida: {ticket.horario}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} />
                    <span>{ticket.cantidad} persona{ticket.cantidad !== 1 && "s"}</span>
                  </div>
                </div>
              </Card>

              <MapaRutas
                coordenadasRecorrido={ticket.trazado}
                paradas={ticket.paradas}
                busPosicion={tracking.posicion}
              />

              <p className="mt-3 text-center text-xs text-muted-foreground">
                La posición del bus es una estimación basada en el horario, no
                una ubicación GPS en tiempo real.
              </p>
            </>
          )}
        </main>
      </div>
    </div>
  );
}