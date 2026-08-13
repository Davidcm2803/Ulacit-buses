import { cn } from "../../lib/utils";

const MODOS = [
  { key: "origen",  label: "Origen",   dot: "bg-green-500", active: "bg-green-500 text-white", inactive: "text-green-700 hover:bg-green-50" },
  { key: "parada",  label: "+ Parada", dot: "bg-blue-500",  active: "bg-blue-500 text-white",  inactive: "text-blue-700 hover:bg-blue-50" },
  { key: "destino", label: "Destino",  dot: "bg-red-500",   active: "bg-red-500 text-white",   inactive: "text-red-700 hover:bg-red-50" },
];

export default function AdminModePicker({ modo, onModo, puntos }) {
  const tieneOrigen  = puntos.some((p) => p.tipo === "origen");
  const tieneDestino = puntos.some((p) => p.tipo === "destino");

  function isDisabled(key) {
    if (key === "origen"  && tieneOrigen)  return true;
    if (key === "destino" && tieneDestino) return true;
    if (key === "parada"  && !tieneOrigen) return true;
    return false;
  }

  return (
    <div className="flex items-center gap-1.5">
      {MODOS.map(({ key, label, dot, active, inactive }) => {
        const disabled = isDisabled(key);
        const isActive = modo === key;
        return (
          <button
            key={key}
            disabled={disabled}
            onClick={() => onModo(key)}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              isActive ? active : inactive,
              disabled && "opacity-30 cursor-not-allowed pointer-events-none"
            )}
          >
            <span className={cn("h-2 w-2 rounded-full flex-shrink-0", isActive ? "bg-white" : dot)} />
            {label}
          </button>
        );
      })}
    </div>
  );
}