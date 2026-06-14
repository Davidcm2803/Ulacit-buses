import { GripVertical, Trash2 } from "lucide-react";
import { cn } from "../../lib/utils";

const TIPO_LABEL = { origen: "Origen", parada: "Parada", destino: "Destino" };
const TIPO_COLOR = {
  origen:  "bg-green-500 text-white",
  parada:  "bg-blue-500 text-white",
  destino: "bg-red-500 text-white",
};

export default function AdminStopList({ puntos, onRemove }) {
  if (puntos.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        Haz clic en el mapa para agregar puntos
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {puntos.map((p, i) => (
        <li
          key={i}
          className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2"
        >
          <GripVertical size={14} className="text-muted-foreground/40 flex-shrink-0" />
          <span className={cn("flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold flex-shrink-0", TIPO_COLOR[p.tipo])}>
            {i + 1}
          </span>
          <div className="flex flex-1 flex-col min-w-0">
            <span className="text-xs font-medium text-foreground truncate">
              {TIPO_LABEL[p.tipo]}
            </span>
            <span className="text-[11px] text-muted-foreground truncate">
              {p.lat.toFixed(5)}, {p.lng.toFixed(5)}
            </span>
          </div>
          <button
            onClick={() => onRemove(i)}
            className="p-1 text-muted-foreground/40 hover:text-red-500 transition-colors flex-shrink-0"
          >
            <Trash2 size={13} />
          </button>
        </li>
      ))}
    </ul>
  );
}