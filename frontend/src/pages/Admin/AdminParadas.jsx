import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { stopsService, routesService } from "../../config/api";
import { getListaProvincias, getListaCantones } from "../../lib/geoCR";

const TIPOS = ["origen", "parada", "destino"];

const FORM_VACIO = {
  nombre: "",
  lat: "",
  lng: "",
  tipo: "parada",
  orden: 0,
  canton: "",
  provincia: "",
  route_id: "",
};

function ModalParada({ inicial, rutas, onClose, onGuardado }) {
  const [form, setForm] = useState(inicial ?? FORM_VACIO);
  const [cantones, setCantones] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const esEdicion = Boolean(inicial?.id);

  useEffect(() => {
    getListaProvincias().then(setProvincias).catch(() => {});
    getListaCantones().then(setCantones).catch(() => {});
  }, []);

  const cantonesFiltrados = useMemo(() => {
    if (!form.provincia) return cantones;
    return cantones.filter((c) => c.provincia === form.provincia);
  }, [cantones, form.provincia]);

  function handleChange(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    const payload = {
      ...form,
      lat: parseFloat(form.lat),
      lng: parseFloat(form.lng),
      orden: parseInt(form.orden, 10) || 0,
    };

    try {
      if (esEdicion) {
        await stopsService.update(inicial.id, payload);
      } else {
        await stopsService.create(payload);
      }
      onGuardado();
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-background shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold text-foreground">
            {esEdicion ? "Editar parada" : "Nueva parada"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 p-5">
          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </p>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Nombre</label>
            <input
              required
              value={form.nombre}
              onChange={(e) => handleChange("nombre", e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Latitud</label>
              <input
                required
                type="number"
                step="any"
                value={form.lat}
                onChange={(e) => handleChange("lat", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Longitud</label>
              <input
                required
                type="number"
                step="any"
                value={form.lng}
                onChange={(e) => handleChange("lng", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Tipo</label>
              <select
                value={form.tipo}
                onChange={(e) => handleChange("tipo", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {TIPOS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Orden</label>
              <input
                type="number"
                value={form.orden}
                onChange={(e) => handleChange("orden", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Provincia</label>
              <select
                required
                value={form.provincia}
                onChange={(e) => {
                  handleChange("provincia", e.target.value);
                  handleChange("canton", "");
                }}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecciona</option>
                {provincias.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Cantón</label>
              <select
                required
                value={form.canton}
                onChange={(e) => handleChange("canton", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecciona</option>
                {cantonesFiltrados.map((c) => (
                  <option key={c.canton} value={c.canton}>{c.canton}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Ruta asociada</label>
            <select
              required
              value={form.route_id}
              onChange={(e) => handleChange("route_id", e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">Selecciona una ruta</option>
              {rutas.map((r) => (
                <option key={r.id} value={r.id}>{r.nombre}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {guardando ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminParadas() {
  const [paradas, setParadas] = useState([]);
  const [rutas, setRutas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [rutaFiltro, setRutaFiltro] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [paradaEditando, setParadaEditando] = useState(null);
  const [borrandoId, setBorrandoId] = useState(null);

  async function cargar() {
    setLoading(true);
    setError(null);
    try {
      const [dataParadas, dataRutas] = await Promise.all([
        stopsService.getAll(),
        routesService.getAll(),
      ]);
      setParadas(dataParadas);
      setRutas(dataRutas);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  const rutaPorId = useMemo(() => {
    const map = {};
    rutas.forEach((r) => { map[r.id] = r.nombre; });
    return map;
  }, [rutas]);

  const paradasFiltradas = useMemo(() => {
    if (!rutaFiltro) return paradas;
    return paradas.filter((p) => p.route_id === rutaFiltro);
  }, [paradas, rutaFiltro]);

  function abrirCrear() {
    setParadaEditando(null);
    setModalAbierto(true);
  }

  function abrirEditar(parada) {
    setParadaEditando(parada);
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setParadaEditando(null);
  }

  function onGuardado() {
    cerrarModal();
    cargar();
  }

  async function handleBorrar(id, nombre) {
    const confirmar = window.confirm(`¿Borrar la parada "${nombre}"?`);
    if (!confirmar) return;

    setBorrandoId(id);
    try {
      await stopsService.remove(id);
      setParadas((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      alert(e.message);
    } finally {
      setBorrandoId(null);
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Paradas</h1>
        <button
          onClick={abrirCrear}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus size={15} />
          Nueva parada
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <select
          value={rutaFiltro}
          onChange={(e) => setRutaFiltro(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">Todas las rutas</option>
          {rutas.map((r) => (
            <option key={r.id} value={r.id}>{r.nombre}</option>
          ))}
        </select>

        {rutaFiltro && (
          <button
            onClick={() => setRutaFiltro("")}
            className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
          >
            Limpiar filtro
          </button>
        )}
      </div>

      {loading && <p className="text-sm text-muted-foreground">Cargando paradas...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Tipo</th>
                <th className="px-4 py-2">Orden</th>
                <th className="px-4 py-2">Cantón</th>
                <th className="px-4 py-2">Ruta</th>
                <th className="px-4 py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paradasFiltradas
                .slice()
                .sort((a, b) => a.orden - b.orden)
                .map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="px-4 py-2 font-medium text-foreground">{p.nombre}</td>
                    <td className="px-4 py-2">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground">
                        {p.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{p.orden}</td>
                    <td className="px-4 py-2 text-muted-foreground">{p.canton}</td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {rutaPorId[p.route_id] ?? "—"}
                    </td>
                    <td className="px-4 py-2 text-right space-x-3">
                      <button
                        onClick={() => abrirEditar(p)}
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        <Pencil size={13} />
                        Editar
                      </button>
                      <button
                        onClick={() => handleBorrar(p.id, p.nombre)}
                        disabled={borrandoId === p.id}
                        className="inline-flex items-center gap-1 text-red-500 hover:underline disabled:opacity-50"
                      >
                        <Trash2 size={13} />
                        {borrandoId === p.id ? "..." : "Borrar"}
                      </button>
                    </td>
                  </tr>
                ))}

              {paradasFiltradas.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                    No hay paradas para este filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalAbierto && (
        <ModalParada
          inicial={paradaEditando}
          rutas={rutas}
          onClose={cerrarModal}
          onGuardado={onGuardado}
        />
      )}
    </div>
  );
}