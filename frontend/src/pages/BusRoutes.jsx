import Navbar from "../components/layout/NavBar";
import BuscadorRutas from "../components/routes/RouteSearch";
import { useDarkMode } from "../hooks/useDarkMode";

export default function Rutas() {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-background transition-colors duration-300">
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="mb-6 text-3xl font-bold tracking-tight">Rutas</h1>
          <BuscadorRutas />
        </main>
      </div>
    </div>
  );
}