import { useNavigate } from "react-router-dom";
import { Trash2, MapPin, Clock, Users } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useDarkMode } from "../hooks/useDarkMode";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { item, updateCantidad, clearCart } = useCart();

  const total = item ? item.tarifa * item.cantidad : 0;

  function handlePagar() {
    //  conectar con Stripe 
    alert("Aquí se conecta el pago con Stripe");
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
                <button
                  onClick={clearCart}
                  className="text-muted-foreground hover:text-red-500"
                  title="Quitar del carrito"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="mb-4 flex flex-col gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>Abordaje: {item.paradaNombre}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>Horario: {item.horario}</span>
                </div>
              </div>

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

              <div className="flex items-center justify-between border-t border-border pt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-primary">₡{total.toLocaleString()}</p>
                </div>
                <Button onClick={handlePagar}>Continuar al pago</Button>
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}