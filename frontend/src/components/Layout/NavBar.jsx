import { Bus, Moon, Sun, Menu, X, LogIn, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthModal } from "../Layout/AuthModal";
import { logout, observeAuthState, getCurrentProfile } from "../../services/authService";

const LINKS = [{ label: "Rutas", href: "/rutas" }];

export default function Navbar({ darkMode, toggleDarkMode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { pathname } = useLocation();

  const displayName = profile?.username || profile?.email || "Usuario";
  const initial = displayName.trim().charAt(0).toUpperCase();

  useEffect(() => {
    const unsubscribe = observeAuthState(async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          setProfile(null);
          return;
        }

        const currentProfile = await getCurrentProfile();
        setProfile(currentProfile);
      } catch (error) {
        console.error("Error restaurando la sesión:", error);
        setProfile(null);
      } finally {
        setAuthLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const handleAuthSuccess = (userProfile) => {
    setProfile(userProfile);
    setShowModal(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setProfile(null);
      setMenuOpen(false);
    } catch (error) {
      console.error("Error cerrando sesión:", error);
    }
  };

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
          {LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm transition-colors hover:text-foreground ${pathname === link.href ? "text-foreground" : "text-muted-foreground"}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {authLoading ? (
            <div className="hidden h-9 w-32 animate-pulse rounded-md bg-muted md:block" />
          ) : profile ? (
            <>
              <div className="hidden md:inline-flex items-center gap-2 h-9 px-2 rounded-md border border-border text-sm text-foreground">
                {profile.photo_url ? (
                  <img src={profile.photo_url} alt={displayName} referrerPolicy="no-referrer" className="h-7 w-7 rounded-full object-cover" />
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

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted md:hidden"
          >
            {menuOpen ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="border-t border-border bg-background px-4 py-3 md:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="block py-2 text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {authLoading ? (
            <div className="my-2 h-9 w-32 animate-pulse rounded-md bg-muted" />
          ) : profile ? (
            <>
              <div className="flex items-center gap-2 py-2 text-sm text-foreground">
                {profile.photo_url ? (
                  <img src={profile.photo_url} alt={displayName} referrerPolicy="no-referrer" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {initial}
                  </span>
                )}

                <span>{displayName}</span>
              </div>

              <button type="button" onClick={handleLogout} className="flex items-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground">
                <LogOut size={14} />
                Cerrar sesión
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setShowModal(true);
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <LogIn size={14} />
              Iniciar sesión
            </button>
          )}
        </div>
      )}

      {showModal && <AuthModal onClose={() => setShowModal(false)} onSuccess={handleAuthSuccess} />}
    </header>
  );
}