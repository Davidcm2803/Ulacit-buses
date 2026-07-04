import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Save, Trash2, Route } from "lucide-react";
import { cn } from "../../lib/utils";
import AdminMapPicker from "../../components/admin/AdminMapPicker";
import AdminModePicker from "../../components/admin/AdminModePicker";
import AdminStopList from "../../components/admin/AdminStopList";
import AdminRouteForm from "../../components/admin/AdminRouteForm";
import AdminRouteSummary from "../../components/admin/AdminRouteSummary";
import useAdminRuta from "../../hooks/useAdminRuta";

const TABS_MOBILE = [
  { key: "form", label: "Formulario" },
  { key: "paradas", label: "Paradas" },
  { key: "resumen", label: "Resumen" },
];

export default function AdminCrearRuta() {
  const {
    puntos,
    modo,
    setModo,
    trazado,
    distanciaKm,
    tiempoMin,
    error,
    loading,
    form,
    formErrors,
    handleFormChange,
    handleMapClick,
    movePoint,
    renamePoint,
    removePoint,
    clearAll,
    generarTrazado,
    handleGuardar,
  } = useAdminRuta();

  const [tabMobile, setTabMobile] = useState("form");

  async function onGuardar() {
    if (trazado.length === 0) await generarTrazado();
    await handleGuardar();
  }

  return (
    <div className="flex min-h-full flex-col lg:h-full">
      <div className="flex h-16 items-center justify-between border-b border-border px-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Link
            to="/admin/rutas"
            className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={15} />
            <span className="hidden sm:inline">Rutas</span>
          </Link>
          <span className="hidden text-muted-foreground/40 sm:inline">/</span>
          <span className="truncate text-sm font-medium text-foreground">
            Crear nueva ruta
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors sm:px-3"
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline">Limpiar</span>
          </button>
          <button
            onClick={onGuardar}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity sm:px-4"
          >
            <Save size={14} />
            <span className="hidden sm:inline">Guardar ruta</span>
          </button>
        </div>
      </div>

      <div className="hidden flex-1 grid-cols-[320px_1fr_280px] overflow-hidden lg:grid">
        <div className="flex flex-col gap-6 overflow-y-auto border-r border-border p-5">
          <div>
            <h2 className="mb-4 text-sm font-semibold text-foreground">
              Información de la ruta
            </h2>
            <AdminRouteForm form={form} onChange={handleFormChange} errors={formErrors} />
          </div>
          <div>
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              Paradas ({puntos.length})
            </h2>
            <AdminStopList puntos={puntos} onRemove={removePoint} onRename={renamePoint} />
          </div>
        </div>

        <div className="flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="text-sm font-medium text-foreground">Mapa Dinámico</span>
            <div className="flex items-center gap-3">
              <AdminModePicker modo={modo} onModo={setModo} puntos={puntos} />
              <button
                onClick={generarTrazado}
                disabled={loading || puntos.length < 2}
                className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Route size={13} />
                {loading ? "Generando..." : "Generar ruta"}
              </button>
            </div>
          </div>

          {error && (
            <div className="border-b border-red-200 bg-red-50 dark:bg-red-950/30 px-4 py-2">
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex-1">
            <AdminMapPicker
              modo={modo}
              puntos={puntos}
              trazado={trazado}
              onMapClick={handleMapClick}
              onPuntoMove={movePoint}
              cantonOrigen={form.canton_origen}
            />
          </div>

          <div className="border-t border-border bg-muted/30 px-4 py-2.5 text-center">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Instrucciones:</span> Selecciona el
              modo y haz clic en el mapa. Arrastra los marcadores para ajustar.
              Mínimo 100m entre paradas, máximo 10 paradas intermedias.
            </p>
          </div>
        </div>

        <div className="overflow-y-auto border-l border-border p-5">
          <AdminRouteSummary puntos={puntos} distanciaKm={distanciaKm} tiempoMin={tiempoMin} />
        </div>
      </div>

      <div className="flex flex-col lg:hidden">
        <div className="flex flex-col border-b border-border">
          <div className="flex items-center gap-2 overflow-x-auto px-3 py-2">
            <AdminModePicker modo={modo} onModo={setModo} puntos={puntos} />
          </div>

          <div className="flex items-center justify-between px-3 pb-2">
            <span className="text-xs text-muted-foreground">
              {puntos.length} punto{puntos.length !== 1 && "s"}
            </span>
            <button
              onClick={generarTrazado}
              disabled={loading || puntos.length < 2}
              className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Route size={13} />
              {loading ? "Generando..." : "Generar ruta"}
            </button>
          </div>

          {error && (
            <div className="border-t border-red-200 bg-red-50 dark:bg-red-950/30 px-3 py-2">
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="h-[38vh] min-h-[220px] shrink-0">
            <AdminMapPicker
              modo={modo}
              puntos={puntos}
              trazado={trazado}
              onMapClick={handleMapClick}
              onPuntoMove={movePoint}
              cantonOrigen={form.canton_origen}
            />
          </div>
        </div>

        <div className="sticky top-0 z-10 flex border-b border-border bg-background">
          {TABS_MOBILE.map((t) => (
            <button
              key={t.key}
              onClick={() => setTabMobile(t.key)}
              className={cn(
                "flex-1 border-b-2 px-2 py-2.5 text-xs font-medium transition-colors",
                tabMobile === t.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground"
              )}
            >
              {t.key === "paradas" ? `${t.label} (${puntos.length})` : t.label}
            </button>
          ))}
        </div>

        <div className="p-4 pb-24">
          {tabMobile === "form" && (
            <AdminRouteForm form={form} onChange={handleFormChange} errors={formErrors} />
          )}
          {tabMobile === "paradas" && (
            <AdminStopList puntos={puntos} onRemove={removePoint} onRename={renamePoint} />
          )}
          {tabMobile === "resumen" && (
            <AdminRouteSummary puntos={puntos} distanciaKm={distanciaKm} tiempoMin={tiempoMin} />
          )}
        </div>
      </div>
    </div>
  );
}