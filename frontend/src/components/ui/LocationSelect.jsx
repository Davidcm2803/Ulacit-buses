import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { cargarCantonesCR } from "../../lib/cantonesCR";

export default function LocationSelect({ label, value, onChange }) {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const provincia = value?.provincia ?? "";
  const canton = value?.canton ?? "";

  useEffect(() => {
    cargarCantonesCR()
      .then(setDatos)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const cantones = datos.find((g) => g.provincia === provincia)?.cantones ?? [];

  function handleProvincia(e) {
    // al cambiar provincia se resetea el cantón, porque ya no aplica
    onChange?.({ provincia: e.target.value, canton: "" });
  }

  function handleCanton(e) {
    onChange?.({ provincia, canton: e.target.value });
  }

  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <MapPin
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <select
            value={provincia}
            onChange={handleProvincia}
            disabled={loading}
            className="h-10 w-full appearance-none rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none focus:border-primary disabled:opacity-50"
          >
            <option value="">{loading ? "Cargando..." : "Provincia"}</option>
            {datos.map((g) => (
              <option key={g.provincia} value={g.provincia}>
                {g.provincia}
              </option>
            ))}
          </select>
        </div>

        <select
          value={canton}
          onChange={handleCanton}
          disabled={!provincia}
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary disabled:opacity-50"
        >
          <option value="">Cantón (todos)</option>
          {cantones.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}