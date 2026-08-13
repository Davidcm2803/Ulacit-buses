import { useEffect, useState } from "react";
import * as Select from "@radix-ui/react-select";
import { MapPin, ChevronDown, Check } from "lucide-react";
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

  function handleProvincia(v) {
    onChange?.({ provincia: v, canton: "" });
  }

  function handleCanton(v) {
    onChange?.({ provincia, canton: v === "__todos__" ? "" : v });
  }

  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          {label}
        </label>
      )}

      <div className="flex h-11 items-stretch overflow-hidden rounded-md border border-border bg-background transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25">
        <Select.Root value={provincia} onValueChange={handleProvincia} disabled={loading}>
          <Select.Trigger
            aria-label="Provincia"
            className="flex flex-1 items-center gap-2 pl-3 pr-2 text-sm text-foreground outline-none data-[placeholder]:text-muted-foreground hover:enabled:bg-muted disabled:opacity-50"
          >
            <MapPin size={15} className="shrink-0 text-muted-foreground" />
            <Select.Value placeholder={loading ? "Cargando..." : "Provincia"} />
            <Select.Icon className="ml-auto">
              <ChevronDown size={14} className="text-muted-foreground" />
            </Select.Icon>
          </Select.Trigger>

          <Select.Portal>
            <Select.Content
              position="popper"
              sideOffset={6}
              className="z-50 w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-border bg-background shadow-lg"
            >
              <Select.Viewport className="max-h-64 p-1">
                {datos.map((g) => (
                  <Select.Item
                    key={g.provincia}
                    value={g.provincia}
                    className="flex cursor-pointer select-none items-center justify-between rounded-sm px-2.5 py-2 text-sm text-foreground outline-none data-[highlighted]:bg-muted"
                  >
                    <Select.ItemText>{g.provincia}</Select.ItemText>
                    <Select.ItemIndicator>
                      <Check size={14} className="text-primary" />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>

        <div className="w-px shrink-0 bg-border" />

        <Select.Root
          value={canton || "__todos__"}
          onValueChange={handleCanton}
          disabled={!provincia}
        >
          <Select.Trigger
            aria-label="Cantón"
            className="flex flex-1 items-center gap-2 pl-3 pr-2 text-sm outline-none hover:enabled:bg-muted disabled:opacity-40"
          >
            <Select.Value />
            <Select.Icon className="ml-auto">
              <ChevronDown size={14} className="text-muted-foreground" />
            </Select.Icon>
          </Select.Trigger>

          <Select.Portal>
            <Select.Content
              position="popper"
              sideOffset={6}
              className="z-50 w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-border bg-background shadow-lg"
            >
              <Select.Viewport className="max-h-64 p-1">
                <Select.Item
                  value="__todos__"
                  className="flex cursor-pointer select-none items-center justify-between rounded-sm px-2.5 py-2 text-sm text-muted-foreground outline-none data-[highlighted]:bg-muted"
                >
                  <Select.ItemText>Cantón (todos)</Select.ItemText>
                </Select.Item>
                {cantones.map((c) => (
                  <Select.Item
                    key={c}
                    value={c}
                    className="flex cursor-pointer select-none items-center justify-between rounded-sm px-2.5 py-2 text-sm text-foreground outline-none data-[highlighted]:bg-muted"
                  >
                    <Select.ItemText>{c}</Select.ItemText>
                    <Select.ItemIndicator>
                      <Check size={14} className="text-primary" />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}