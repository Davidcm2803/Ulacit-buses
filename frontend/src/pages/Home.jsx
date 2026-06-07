import Navbar from "../components/layout/Navbar";
import { useDarkMode } from "../hooks/useDarkMode";

export default function Home() {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-background transition-colors duration-300">
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      </div>
    </div>
  );
}