import { Link } from "react-router-dom";
import { ArrowLeft, Save, Trash2, Route } from "lucide-react";
import AdminMapPicker from "../../components/admin/AdminMapPicker";
import AdminModePicker from "../../components/admin/AdminModePicker";
import AdminStopList from "../../components/admin/AdminStopList";
import AdminRouteForm from "../../components/admin/AdminRouteForm";
import AdminRouteSummary from "../../components/admin/AdminRouteSummary";
import useAdminRuta from "../../hooks/useAdminRuta";

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
    removePoint,
    clearAll,
    generarTrazado,
    handleGuardar,
  } = useAdminRuta();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-border px-6">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/rutas"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={15} />
            Rutas
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-sm font-medium text-foreground">
            Crear nueva ruta
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearAll}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors"
          >
            <Trash2 size={14} />
            Limpiar
          </button>
          <button
            onClick={async () => {
              if (trazado.length === 0) await generarTrazado();
              await handleGuardar();
            }}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Save size={14} />
            Guardar ruta
          </button>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-[320px_1fr_280px] overflow-hidden">
        <div className="flex flex-col gap-6 overflow-y-auto border-r border-border p-5">
          <div>
            <h2 className="mb-4 text-sm font-semibold text-foreground">
              Información de la ruta
            </h2>
            <AdminRouteForm
              form={form}
              onChange={handleFormChange}
              errors={formErrors}
            />
          </div>
          <div>
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              Paradas ({puntos.length})
            </h2>
            <AdminStopList puntos={puntos} onRemove={removePoint} />
          </div>
        </div>

        <div className="flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="text-sm font-medium text-foreground">
              Mapa Dinámico
            </span>
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
            />
          </div>

          <div className="text-center border-t border-border bg-muted/30 px-4 py-2.5">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Instrucciones:</span> Selecciona el
              modo y haz clic en el mapa. Arrastra los marcadores para ajustar.
              Mínimo 100m entre paradas, máximo 10 paradas intermedias.
            </p>
          </div>
        </div>

        <div className="overflow-y-auto border-l border-border p-5">
          <AdminRouteSummary
            puntos={puntos}
            distanciaKm={distanciaKm}
            tiempoMin={tiempoMin}
          />
        </div>
      </div>
    </div>
  );
}
