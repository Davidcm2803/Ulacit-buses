import { useState } from "react";
import {
  Bus,
  LayoutDashboard,
  Map,
  MapPin,
  LogOut,
  ChevronLeft,
  ChevronRight,
  HomeIcon,
  Sun,
  Moon,
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { useDarkMode } from "../../hooks/useDarkMode";

const NAV = [
  { label: "Inicio", href: "/", icon: HomeIcon },
  { label: "Panel", href: "/admin", icon: LayoutDashboard },
  { label: "Rutas", href: "/admin/rutas", icon: Map },
  { label: "Paradas", href: "/admin/paradas", icon: MapPin },
];

export default function AdminSidebar() {
  const { pathname } = useLocation();
  const [colapsado, setColapsado] = useState(false); // solo-iconos en desktop
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <>
      <aside
        className={cn(
          "hidden h-screen flex-col transition-all duration-200 lg:flex",
          colapsado ? "w-16" : "w-56"
        )}
        style={{ background: "#1e293b" }}
      >
        <div
          className={cn(
            "flex h-16 items-center gap-2.5 px-4",
            colapsado && "justify-center px-2"
          )}
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Bus size={14} />
          </div>
          <span className={cn("font-bold text-white", colapsado && "hidden")}>
            506Tracker
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              to={href}
              title={colapsado ? label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                colapsado && "justify-center px-2",
                pathname === href
                  ? "bg-white/10 text-white font-medium"
                  : "text-white/50 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon size={16} className="shrink-0" />
              <span className={cn(colapsado && "hidden")}>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-1 p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button
            onClick={() => setColapsado((c) => !c)}
            title={colapsado ? "Expandir" : "Colapsar"}
            className={cn(
              "flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            )}
          >
            {colapsado ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          <button
            type="button"
            onClick={toggleDarkMode}
            title={colapsado ? (darkMode ? "Modo claro" : "Modo oscuro") : undefined}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/50 transition-colors hover:bg-white/10 hover:text-white",
              colapsado && "justify-center px-2"
            )}
          >
            {darkMode ? <Sun size={16} className="shrink-0" /> : <Moon size={16} className="shrink-0" />}
            <span className={cn(colapsado && "hidden")}>
              {darkMode ? "Modo claro" : "Modo oscuro"}
            </span>
          </button>

          <button
            title={colapsado ? "Cerrar sesión" : undefined}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/50 transition-colors hover:bg-white/10 hover:text-white",
              colapsado && "justify-center px-2"
            )}
          >
            <LogOut size={16} className="shrink-0" />
            <span className={cn(colapsado && "hidden")}>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-white/10 py-2 lg:hidden"
        style={{ background: "#1e293b" }}
      >
        {NAV.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            to={href}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-1 text-xs",
              pathname === href ? "text-white" : "text-white/50"
            )}
          >
            <Icon size={20} />
            {label}
          </Link>
        ))}
        <button
          type="button"
          onClick={toggleDarkMode}
          className="flex flex-col items-center gap-1 px-3 py-1 text-xs text-white/50"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          {darkMode ? "Claro" : "Oscuro"}
        </button>
        <button className="flex flex-col items-center gap-1 px-3 py-1 text-xs text-white/50">
          <LogOut size={20} />
          Salir
        </button>
      </nav>
    </>
  );
}