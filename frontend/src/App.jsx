import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Rutas from "./pages/BusRoutes";
import History from "./pages/History";
import DetalleRuta from "./pages/RouteDetails";
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminCrearRuta from "./pages/Admin/AdminCrearRuta";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminRutas from "./pages/Admin/AdminRutas";
import AdminParadas from "./pages/Admin/AdminParadas";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rutas" element={<Rutas />} />
        <Route path="/rutas/:id" element={<DetalleRuta />} />
        <Route path="/history" element={<History />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="rutas" element={<AdminRutas />} />
          <Route path="rutas/nueva" element={<AdminCrearRuta />} />
          <Route path="paradas" element={<AdminParadas />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;