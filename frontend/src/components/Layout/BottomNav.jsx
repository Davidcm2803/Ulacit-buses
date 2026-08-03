import { Home, Route as RouteIcon, Ticket, User, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function BottomNav({ profile, isAdmin, onPerfilClick }) {
  const { pathname } = useLocation();

  const items = [
    { label: "Inicio", href: "/", icon: Home },
    { label: "Rutas", href: "/rutas", icon: RouteIcon },
    ...(profile ? [{ label: "Tickets", href: "/tickets", icon: Ticket }] : []),
    ...(isAdmin ? [{ label: "Admin", href: "/admin", icon: ShieldCheck }] : []),
  ];

  const activo = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background md:hidden">
      <div
        className="grid h-16"
        style={{ gridTemplateColumns: `repeat(${items.length + 1}, minmax(0, 1fr))` }}
      >
        {items.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            to={href}
            className={`flex flex-col items-center justify-center gap-1 text-[11px] ${
              activo(href) ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon size={20} />
            {label}
          </Link>
        ))}

        <button
          type="button"
          onClick={onPerfilClick}
          className="flex flex-col items-center justify-center gap-1 text-[11px] text-muted-foreground"
        >
          {profile?.photo_url ? (
            <img
              src={profile.photo_url}
              alt=""
              referrerPolicy="no-referrer"
              className="h-5 w-5 rounded-full object-cover"
            />
          ) : (
            <User size={20} />
          )}
          Perfil
        </button>
      </div>
    </nav>
  );
}