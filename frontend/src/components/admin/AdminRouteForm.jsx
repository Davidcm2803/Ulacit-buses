import { cn } from "../../lib/utils";

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

export default function AdminRouteForm({ form, onChange, errors }) {
  const set = (k) => (e) => onChange(k, e.target.value);

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