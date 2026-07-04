import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Rutas from "./pages/BusRoutes";
import History from "./pages/History";
import DetalleRuta from "./pages/RouteDetails";
import Cart from "./pages/Cart";
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminCrearRuta from "./pages/Admin/AdminCrearRuta";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminRutas from "./pages/Admin/AdminRutas";
import AdminParadas from "./pages/Admin/AdminParadas";
import ProtectedRoute from "./components/Layout/ProtectedRoute";
import { CartProvider } from "./context/CartContext";

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rutas" element={<Rutas />} />
          <Route path="/rutas/:id" element={<DetalleRuta />} />
          <Route path="/carrito" element={<Cart />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/history" element={<History />} />
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="rutas" element={<AdminRutas />} />
            <Route path="rutas/nueva" element={<AdminCrearRuta />} />
            <Route path="paradas" element={<AdminParadas />} />
          </Route>
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;