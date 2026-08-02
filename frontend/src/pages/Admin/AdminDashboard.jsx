import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Map, MapPin, CheckCircle2, XCircle, Plus, ArrowRight } from "lucide-react";
import { routesService, stopsService } from "../../config/api";

function StatRow({ icon: Icon, label, value, tone = "default" }) {
  const toneClasses = {
    default: "bg-primary/10 text-primary",
    green: "bg-green-500/10 text-green-600",
    gray: "bg-gray-500/10 text-gray-500",
  };

  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [rutas, setRutas] = useState([]);
  const [paradas, setParadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function cargar() {
      setLoading(true);
      setError(null);
      try {
        const [dataRutas, dataParadas] = await Promise.all([
          routesService.getAll(),
          stopsService.getAll(),
        ]);
        setRutas(dataRutas);
        setParadas(dataParadas);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, []);

  const activas = rutas.filter((r) => r.activa).length;
  const inactivas = rutas.length - activas;

  const ultimasRutas = [...rutas]
    .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
    .slice(0, 6);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Panel</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Resumen general de rutas y paradas del sistema
          </p>
        </div>
        <Link
          to="/admin/rutas/nueva"
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus size={15} />
          Nueva ruta
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando panel...</p>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 divide-x divide-border rounded-lg border border-border sm:grid-cols-4 sm:divide-y-0">
            <StatRow icon={Map} label="Rutas totales" value={rutas.length} />
            <StatRow icon={CheckCircle2} label="Rutas activas" value={activas} tone="green" />
            <StatRow icon={XCircle} label="Rutas inactivas" value={inactivas} tone="gray" />
            <StatRow icon={MapPin} label="Paradas totales" value={paradas.length} />
          </div>

          <div className="rounded-lg border border-border">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h2 className="text-sm font-semibold text-foreground">Últimas rutas creadas</h2>
              <Link
                to="/admin/rutas"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Ver todas
                <ArrowRight size={12} />
              </Link>
            </div>

            {ultimasRutas.length === 0 ? (
              <p className="px-5 py-6 text-center text-sm text-muted-foreground">
                Todavía no hay rutas creadas.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr>
                    <th className="px-5 py-2 font-medium">Nombre</th>
                    <th className="px-5 py-2 font-medium">Código</th>
                    <th className="px-5 py-2 font-medium">Origen → Destino</th>
                    <th className="px-5 py-2 font-medium">Tarifa</th>
                    <th className="px-5 py-2 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimasRutas.map((r) => (
                    <tr key={r.id} className="border-t border-border">
                      <td className="px-5 py-2.5">
                        <Link to={`/admin/rutas/${r.id}/editar`} className="font-medium text-foreground hover:text-primary">
                          {r.nombre}
                        </Link>
                      </td>
                      <td className="px-5 py-2.5 text-muted-foreground">{r.codigo}</td>
                      <td className="px-5 py-2.5 text-muted-foreground">
                        {r.canton_origen} → {r.canton_destino}
                      </td>
                      <td className="px-5 py-2.5">₡{r.tarifa}</td>
                      <td className="px-5 py-2.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            r.activa
                              ? "bg-green-500/10 text-green-600"
                              : "bg-gray-500/10 text-gray-500"
                          }`}
                        >
                          {r.activa ? "Activa" : "Inactiva"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}