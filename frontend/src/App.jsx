import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Rutas from "./pages/BusRoutes";
import DetalleRuta from "./pages/RouteDetails";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rutas" element={<Rutas />} />
        <Route path="/rutas/:id" element={<DetalleRuta />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;