import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "carrito_boleto";

export function CartProvider({ children }) {
  const [item, setItem] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (item) localStorage.setItem(STORAGE_KEY, JSON.stringify(item));
    else localStorage.removeItem(STORAGE_KEY);
  }, [item]);

  function addToCart(nuevoItem) {
    if (item && item.rutaId !== nuevoItem.rutaId) {
      const reemplazar = window.confirm(
        `Ya tienes un boleto de "${item.rutaNombre}" en el carrito. Solo puedes comprar una ruta a la vez. ¿Reemplazarlo por "${nuevoItem.rutaNombre}"?`,
      );
      if (!reemplazar) return false;
    }
    setItem(nuevoItem);
    return true;
  }

  function updateCantidad(cantidad) {
    setItem((prev) => (prev ? { ...prev, cantidad } : prev));
  }

  function clearCart() {
    setItem(null);
  }

  return (
    <CartContext.Provider value={{ item, addToCart, updateCantidad, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}