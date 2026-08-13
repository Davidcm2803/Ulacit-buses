import { useEffect, useMemo, useState } from "react";
import { cn } from "../../lib/utils";
import { getListaCantones } from "../../lib/geoCR";

function Field({ label, children, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground",
        "placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors",
        className
      )}
      {...props}
    />
  );
}

function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground",
        "focus:outline-none focus:border-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export default function AdminRouteForm({ form, onChange, errors }) {
  const [cantones, setCantones] = useState([]);
  const set = (k) => (e) => onChange(k, e.target.value);

  useEffect(() => {
    getListaCantones().then(setCantones);
  }, []);

  const provincias = useMemo(() => {
    const vistas = new Set();
    return cantones
      .map((c) => c.provincia)
      .filter((p) => {
        if (vistas.has(p)) return false;
        vistas.add(p);
        return true;
      })
      .sort();
  }, [cantones]);

  const cantonesDeProvincia = useMemo(
    () => cantones.filter((c) => c.provincia === form.provincia_origen),
    [cantones, form.provincia_origen],
  );

  function handleProvinciaChange(e) {
    onChange("provincia_origen", e.target.value);
    onChange("canton_origen", ""); 
  }

  function handleCantonChange(e) {
    onChange("canton_origen", e.target.value);
  }

  return (
    <div className="flex flex-col gap-4">
      <Field label="Nombre de la ruta" error={errors?.nombre}>
        <Input
          placeholder="Ej. San José → Escazú"
          value={form.nombre}
          onChange={set("nombre")}
        />
      </Field>

      <Field label="Código de la ruta" error={errors?.codigo}>
        <Input
          placeholder="Ej. SJ-ES-01"
          value={form.codigo}
          onChange={set("codigo")}
        />
      </Field>

      <Field label="Descripción">
        <textarea
          className={cn(
            "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground resize-none",
            "placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors"
          )}
          rows={3}
          placeholder="Descripción de la ruta"
          value={form.descripcion}
          onChange={set("descripcion")}
        />
      </Field>

      <Field label="Provincia de origen" error={errors?.provincia_origen}>
        <Select value={form.provincia_origen ?? ""} onChange={handleProvinciaChange}>
          <option value="">Selecciona una provincia</option>
          {provincias.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Cantón de origen" error={errors?.canton_origen}>
        <Select
          value={form.canton_origen ?? ""}
          onChange={handleCantonChange}
          disabled={!form.provincia_origen}
        >
          <option value="">
            {form.provincia_origen ? "Selecciona un cantón" : "Primero elige una provincia"}
          </option>
          {cantonesDeProvincia.map((c) => (
            <option key={c.canton} value={c.canton}>
              {c.canton}
            </option>
          ))}
        </Select>
        <p className="text-[11px] text-muted-foreground">
          El punto de origen deberá caer dentro de este cantón. El destino y las
          paradas pueden estar en cualquier otro cantón.
        </p>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Primer bus" error={errors?.primer_bus}>
          <Input type="time" value={form.primer_bus} onChange={set("primer_bus")} />
        </Field>
        <Field label="Último bus" error={errors?.ultimo_bus}>
          <Input type="time" value={form.ultimo_bus} onChange={set("ultimo_bus")} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Frecuencia (min)" error={errors?.frecuencia}>
          <Input
            type="number"
            min={1}
            placeholder="25"
            value={form.frecuencia}
            onChange={set("frecuencia")}
          />
        </Field>
        <Field label="Tarifa (₡)" error={errors?.tarifa}>
          <Input
            type="number"
            min={0}
            placeholder="665"
            value={form.tarifa}
            onChange={set("tarifa")}
          />
        </Field>
      </div>
    </div>
  );
}