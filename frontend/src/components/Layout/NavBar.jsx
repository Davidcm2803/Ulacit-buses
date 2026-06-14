import { Bus, Moon, Sun, Menu, X, LogIn } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthModal } from "../layout/AuthModal";

const LINKS = [
  { label: "Rutas", href: "/rutas" },
];

export default function Navbar({ darkMode, toggleDarkMode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="border-b border-border bg-background">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Bus size={14} />
          </div>
          <span className="text-foreground">
            506<span className="text-foreground">Tracker</span>
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              className={`text-sm transition-colors hover:text-foreground ${
                pathname === l.href ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="hidden md:inline-flex items-center gap-2 h-8 px-3 rounded-md border border-border text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogIn size={14} />
            Iniciar sesión
          </button>

          <button
            onClick={toggleDarkMode}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted md:hidden"
          >
            {menuOpen ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="border-t border-border bg-background px-4 py-3 md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              className="block py-2 text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <button
            onClick={() => { setShowModal(true); setMenuOpen(false); }}
            className="flex items-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <LogIn size={14} />
            Iniciar sesión
          </button>
        </div>
      )}

      {showModal && (
        <AuthModal
          onClose={() => setShowModal(false)}
          onSuccess={(user) => console.log("user:", user)}
        />
      )}
    </header>
  );
}