export default function SelectorHorario({ value, onChange, horarios = [] }) {
  if (!horarios.length) {
    return (
      <div>
        <label className="mb-2 block text-sm font-medium text-muted-foreground">
          Horario de salida
        </label>
        <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
          No hay horarios disponibles para este día.
        </p>
      </div>
    );
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-muted-foreground">
        Horario de salida
      </label>
      <div
        className="max-h-40 gap-2 overflow-y-auto rounded-md border border-border p-2"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
        }}
      >
        {horarios.map((h) => (
          <button
            key={h}
            type="button"
            onClick={() => onChange(h)}
            className={`w-full rounded-md border px-2 py-2 text-xs font-medium transition-colors ${
              value === h
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-foreground hover:bg-muted"
            }`}
          >
            {h}
          </button>
        ))}
      </div>
    </div>
  );
}