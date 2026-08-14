import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, MapPin, Clock, Users, Calendar, CheckCircle2, Ticket, Navigation } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import Navbar from "../components/layout/NavBar";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import PaymentForm from "../components/routes/PaymentForm";
import { useDarkMode } from "../hooks/useDarkMode";
import { useCart } from "../context/CartContext";
import { paymentsService, ticketsService } from "../config/api";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function Cart() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { item, updateCantidad, clearCart } = useCart();

  const [clientSecret, setClientSecret] = useState(null);
  const [loadingIntent, setLoadingIntent] = useState(false);
  const [error, setError] = useState("");
  const [pagado, setPagado] = useState(false);
  const [ultimaCompra, setUltimaCompra] = useState(null);

  const total = item ? item.tarifa * item.cantidad : 0;

  async function handlePagar() {
    setError("");
    setLoadingIntent(true);
    try {
      const data = await paymentsService.createIntent({
        monto: total,
        ruta_id: item.rutaId,
        ruta_nombre: item.rutaNombre,
        parada_nombre: item.paradaNombre,
        horario: item.horario,
        fecha: item.fecha,
        cantidad: item.cantidad,
      });
      setClientSecret(data.client_secret);
    } catch (e) {
      setError(e.message || "No se pudo iniciar el pago.");
    } finally {
      setLoadingIntent(false);
    }
  }

  async function handlePagoExitoso(paymentIntentId) {
    try {
      const resultado = await paymentsService.confirm({ payment_intent_id: paymentIntentId });

      // El shape de la respuesta de /payments/confirm puede variar según el
      // backend, así que probamos los campos más comunes primero...
      let ticketId =
        resultado?.id ??
        resultado?.ticket_id ??
        resultado?.ticket?.id ??
        null;

      // ...y si no vino el id, buscamos entre los tickets del usuario el que
      // coincide con la compra que acabamos de hacer.
      if (!ticketId) {
        try {
          const misTickets = await ticketsService.getMine();
          const encontrado = misTickets?.find(
            (t) =>
              t.ruta_id === item.rutaId &&
              t.fecha === item.fecha &&
              t.horario === item.horario &&
              t.parada_nombre === item.paradaNombre,
          );
          ticketId = encontrado?.id ?? null;
        } catch {
          // si esto falla, simplemente no mostramos el botón de seguir viaje
        }
      }

      setUltimaCompra({ ...item, ticketId });
      setPagado(true);
      clearCart();
    } catch (e) {
      setError(e.message || "El pago se realizó pero no se pudo confirmar.");
    }
  }

  if (pagado) {
    return (
      <div className={darkMode ? "dark" : ""}>
        <div className="min-h-screen bg-background transition-colors duration-300">
          <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          <main className="mx-auto max-w-lg px-4 py-16 sm:px-6 lg:px-8">
            <Card className="flex flex-col items-center text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle2 size={34} className="text-emerald-600 dark:text-emerald-400" />
              </div>

              <h1 className="mb-2 text-2xl font-bold text-foreground">
                ¡Listo, tu boleto está confirmado!
              </h1>
              <p className="mb-6 text-muted-foreground">
                {ultimaCompra
                  ? `Ya podés ver los detalles de tu viaje en ${ultimaCompra.rutaNombre} desde "Mis tickets".`
                  : 'Ya podés ver los detalles de tu viaje desde "Mis tickets".'}
              </p>

              {ultimaCompra && (
                <div className="mb-6 w-full rounded-lg border border-border bg-muted/40 p-4 text-left text-sm text-muted-foreground">
                  <div className="mb-1.5 flex items-center gap-2">
                    <MapPin size={14} />
                    <span>{ultimaCompra.paradaNombre}</span>
                  </div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <Calendar size={14} />
                    <span>{ultimaCompra.fecha}</span>
                  </div>
                  <div className={ultimaCompra.ticketId ? "mb-3 flex items-center gap-2" : "flex items-center gap-2"}>
                    <Clock size={14} />
                    <span>{ultimaCompra.horario}</span>
                  </div>
                  {ultimaCompra.ticketId && (
                    <button
                      onClick={() => navigate(`/tickets/${ultimaCompra.ticketId}`)}
                      className="flex w-full items-center justify-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/15"
                    >
                      <Navigation size={14} />
                      Seguir este viaje
                    </button>
                  )}
                </div>
              )}

              <div className="flex w-full flex-col gap-2 sm:flex-row">
                <Button className="flex-1 justify-center" onClick={() => navigate("/tickets")}>
                  <Ticket size={16} />
                  Ir a mis tickets
                </Button>
                <button
                  onClick={() => navigate("/")}
                  className="flex-1 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  Volver al inicio
                </button>
              </div>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-background transition-colors duration-300">
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="mb-6 text-2xl font-bold text-foreground sm:text-3xl">Tu carrito</h1>

          {!item && (
            <div className="flex h-[300px] flex-col items-center justify-center gap-3 rounded-lg border border-border">
              <p className="text-muted-foreground">Tu carrito está vacío.</p>
              <Button onClick={() => navigate("/")}>Buscar una ruta</Button>
            </div>
          )}

          {item && (
            <Card>
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">
                    {item.rutaCodigo}
                  </span>
                  <span className="text-lg font-semibold text-foreground">{item.rutaNombre}</span>
                </div>
                {!clientSecret && (
                  <button
                    onClick={clearCart}
                    className="text-muted-foreground hover:text-red-500"
                    title="Quitar del carrito"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <div className="mb-4 flex flex-col gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>Abordaje: {item.paradaNombre}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>Fecha: {item.fecha}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>Horario: {item.horario}</span>
                </div>
              </div>

              {!clientSecret && (
                <div className="mb-6 flex items-center gap-3 border-t border-border pt-4">
                  <span className="text-sm font-medium text-muted-foreground">Cantidad</span>
                  <button
                    type="button"
                    onClick={() => updateCantidad(Math.max(1, item.cantidad - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-foreground hover:bg-muted"
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-medium text-foreground">{item.cantidad}</span>
                  <button
                    type="button"
                    onClick={() => updateCantidad(Math.min(10, item.cantidad + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-foreground hover:bg-muted"
                  >
                    +
                  </button>
                  <Users size={16} className="ml-1 text-muted-foreground" />
                </div>
              )}

              <div className="mb-4 flex items-center justify-between border-t border-border pt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-primary">₡{total.toLocaleString()}</p>
                </div>
                {!clientSecret && (
                  <Button onClick={handlePagar} disabled={loadingIntent}>
                    {loadingIntent ? "Cargando..." : "Continuar al pago"}
                  </Button>
                )}
              </div>

              {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

              {clientSecret && (
                <div className="border-t border-border pt-4">
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <PaymentForm onSuccess={handlePagoExitoso} />
                  </Elements>
                </div>
              )}
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}