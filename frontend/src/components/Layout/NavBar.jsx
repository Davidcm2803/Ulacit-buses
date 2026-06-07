import { Bus, Moon, Sun, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar({ darkMode, toggleDarkMode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { label: "Rutas", href: "/rutas" },
    { label: "Historial", href: "/historial" },
    { label: "Acerca de", href: "/acerca" },
  ];

  return (
    <header className="border-b border-border bg-background">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <a
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background">
            <Bus size={14} />
          </div>

          <span className="text-foreground">
            506<span className="font-black">Tracker</span>
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary md:hidden"
          >
            {menuOpen ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-border bg-background px-4 py-3 md:hidden">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="block py-2 text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}