import { Bus, LayoutDashboard, Map, MapPin, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";

const NAV = [
  { label: "Panel principal", href: "/admin", icon: LayoutDashboard },
  { label: "Rutas", href: "/admin/rutas", icon: Map },
  { label: "Paradas", href: "/admin/paradas", icon: MapPin },
];

export default function AdminSidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="flex h-screen w-56 flex-col" style={{ background: "#1e293b" }}>
      <div className="flex h-16 items-center gap-2.5 px-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Bus size={14} />
        </div>
        <span className="font-bold text-white">
          506<span className="font-bold text-white">Tracker</span>
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            to={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              pathname === href
                ? "bg-white/10 text-white font-medium"
                : "text-white/50 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/50 transition-colors hover:bg-white/10 hover:text-white">
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}