import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { routesService } from "../../config/api";
import { getListaProvincias, getListaCantones } from "../../lib/geoCR";

export default function AdminRutas() {
  const [rutas, setRutas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [provincias, setProvincias] = useState([]);
  const [cantones, setCantones] = useState([]);
  const [provinciaFiltro, setProvinciaFiltro] = useState("");
  const [cantonFiltro, setCantonFiltro] = useState("");

  const [borrandoId, setBorrandoId] = useState(null);

  async function cargarRutas() {
    setLoading(true);
    setError(null);
    try {
      const data = await routesService.getAll();
      setRutas(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarRutas();
    getListaProvincias().then(setProvincias).catch(() => {});
    getListaCantones().then(setCantones).catch(() => {});
  }, []);

  const cantonesFiltrados = useMemo(() => {
    if (!provinciaFiltro) return cantones;
    return cantones.filter((c) => c.provincia === provinciaFiltro);
  }, [cantones, provinciaFiltro]);

  const rutasFiltradas = useMemo(() => {
    return rutas.filter((r) => {
      const provinciaOk =
        !provinciaFiltro ||
        r.provincia_origen === provinciaFiltro ||
        r.provincia_destino === provinciaFiltro;
      const cantonOk =
        !cantonFiltro ||
        r.canton_origen === cantonFiltro ||
        r.canton_destino === cantonFiltro;
      return provinciaOk && cantonOk;
    });
  }, [rutas, provinciaFiltro, cantonFiltro]);

  function handleProvinciaChange(e) {
    setProvinciaFiltro(e.target.value);
    setCantonFiltro("");
  }

  async function handleBorrar(id, nombre) {
    const confirmar = window.confirm(`¿Borrar la ruta "${nombre}"? Esto también borra sus paradas.`);
    if (!confirmar) return;

    setBorrandoId(id);
    try {
      await routesService.remove(id);
      setRutas((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      alert(e.message);
    } finally {
      setBorrandoId(null);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Rutas</h1>
        <Link
          to="/admin/rutas/nueva"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          + Nueva ruta
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={provinciaFiltro}
          onChange={handleProvinciaChange}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">Todas las provincias</option>
          {provincias.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <select
          value={cantonFiltro}
          onChange={(e) => setCantonFiltro(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">Todos los cantones</option>
          {cantonesFiltrados.map((c) => (
            <option key={c.canton} value={c.canton}>{c.canton}</option>
          ))}
        </select>

        {(provinciaFiltro || cantonFiltro) && (
          <button
            onClick={() => {
              setProvinciaFiltro("");
              setCantonFiltro("");
            }}
            className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {loading && <p className="text-sm text-muted-foreground">Cargando rutas...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Código</th>
                <th className="px-4 py-2">Origen</th>
                <th className="px-4 py-2">Destino</th>
                <th className="px-4 py-2">Tarifa</th>
                <th className="px-4 py-2">Estado</th>
                <th className="px-4 py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rutasFiltradas.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-2 font-medium text-foreground">{r.nombre}</td>
                  <td className="px-4 py-2 text-muted-foreground">{r.codigo}</td>
                  <td className="px-4 py-2">{r.canton_origen}, {r.provincia_origen}</td>
                  <td className="px-4 py-2">{r.canton_destino}, {r.provincia_destino}</td>
                  <td className="px-4 py-2">₡{r.tarifa}</td>
                  <td className="px-4 py-2">
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
                  <td className="px-4 py-2 text-right space-x-2">
                    <Link
                      to={`/admin/rutas/${r.id}/editar`}
                      className="text-primary hover:underline"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleBorrar(r.id, r.nombre)}
                      disabled={borrandoId === r.id}
                      className="text-red-500 hover:underline disabled:opacity-50"
                    >
                      {borrandoId === r.id ? "Borrando..." : "Borrar"}
                    </button>
                  </td>
                </tr>
              ))}

              {rutasFiltradas.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                    No hay rutas con esos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}