import {
  Bus,
  Moon,
  Sun,
  LogIn,
  LogOut,
  ShieldCheck,
  Ticket,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthModal } from "../layout/AuthModal";
import BottomNav from "./BottomNav";
import { logout } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

const LINKS = [
  { label: "Inicio", href: "/" },
  { label: "Rutas", href: "/rutas" },
];

export default function Navbar({ darkMode, toggleDarkMode }) {
  const [showModal, setShowModal] = useState(false);
  const [showPerfilSheet, setShowPerfilSheet] = useState(false);
  const { pathname } = useLocation();
  const { profile, isAdmin, loading } = useAuth();

  const displayName = profile?.username || profile?.email || "Usuario";
  const initial = displayName.trim().charAt(0).toUpperCase();

  const handleAuthSuccess = () => {
    setShowModal(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowPerfilSheet(false);
    } catch (error) {
      console.error("Error cerrando sesión:", error);
    }
  };

  function handlePerfilClick() {
    if (profile) setShowPerfilSheet(true);
    else setShowModal(true);
  }

  return (
    <header className="border-b border-border bg-background">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Bus size={14} />
          </div>
          <span className="text-foreground">
            506<span className="text-foreground">Tracker</span>
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm transition-colors hover:text-foreground ${pathname === link.href ? "text-foreground" : "text-muted-foreground"}`}
            >
              {link.label}
            </Link>
          ))}
          {profile && (
            <Link
              to="/tickets"
              className={`flex items-center gap-1.5 text-sm transition-colors hover:text-foreground ${pathname.startsWith("/tickets") ? "text-foreground" : "text-muted-foreground"}`}
            >
              <Ticket size={14} />
              Tickets
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              to="/admin"
              title="Portal Admin"
              className={`hidden md:inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors ${
                pathname.startsWith("/admin")
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <ShieldCheck size={15} />
            </Link>
          )}

          {loading && !profile ? (
            <div className="hidden h-9 w-32 animate-pulse rounded-md bg-muted md:block" />
          ) : profile ? (
            <>
              <div className="hidden md:inline-flex items-center gap-2 h-9 px-2 rounded-md border border-border text-sm text-foreground">
                {profile.photo_url ? (
                  <img
                    src={profile.photo_url}
                    alt={displayName}
                    referrerPolicy="no-referrer"
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {initial}
                  </span>
                )}
                <span className="max-w-32 truncate">{displayName}</span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                title="Cerrar sesión"
                className="hidden md:inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="hidden md:inline-flex items-center gap-2 h-8 px-3 rounded-md border border-border text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogIn size={14} />
              Iniciar sesión
            </button>
          )}

          <button
            type="button"
            onClick={toggleDarkMode}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Cambiar modo de color"
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </nav>

      <BottomNav profile={profile} isAdmin={isAdmin} onPerfilClick={handlePerfilClick} />

      {showPerfilSheet && profile && (
        <div className="fixed inset-0 z-50 flex items-end md:hidden" onClick={() => setShowPerfilSheet(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-full rounded-t-2xl border-t border-border bg-background p-4 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {profile.photo_url ? (
                  <img
                    src={profile.photo_url}
                    alt={displayName}
                    referrerPolicy="no-referrer"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {initial}
                  </span>
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">{displayName}</p>
                  {profile.email && <p className="text-xs text-muted-foreground">{profile.email}</p>}
                </div>
              </div>
              <button onClick={() => setShowPerfilSheet(false)} className="text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setShowPerfilSheet(false)}
                className="mb-2 flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-foreground"
              >
                <ShieldCheck size={16} />
                Portal Admin
              </Link>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-foreground"
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <AuthModal
          onClose={() => setShowModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </header>
  );
}