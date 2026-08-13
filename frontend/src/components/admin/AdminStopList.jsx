import { useState } from "react";
import { GripVertical, Trash2, Pencil, Check, MapPinOff } from "lucide-react";
import { cn } from "../../lib/utils";

const TIPO_LABEL = { origen: "Origen", parada: "Parada", destino: "Destino" };
const TIPO_COLOR = {
  origen: "bg-green-500 text-white",
  parada: "bg-blue-500 text-white",
  destino: "bg-red-500 text-white",
};

function NombreEditable({ punto, index, onRename }) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(punto.nombre || "");

  function guardar() {
    onRename(index, valor.trim());
    setEditando(false);
  }

  if (editando) {
    return (
      <div className="flex items-center gap-1">
        <input
          autoFocus
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && guardar()}
          placeholder={`Ej. Frente Hospital de Niños`}
          className="w-full rounded border border-primary bg-background px-1.5 py-0.5 text-xs text-foreground focus:outline-none"
        />
        <button onClick={guardar} className="flex-shrink-0 text-primary hover:opacity-70">
          <Check size={13} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 min-w-0">
      <span className="text-xs font-medium text-foreground truncate">
        {punto.nombre || `${TIPO_LABEL[punto.tipo]} sin nombre`}
      </span>
      <button
        onClick={() => setEditando(true)}
        className="flex-shrink-0 text-muted-foreground/40 hover:text-primary transition-colors"
      >
        <Pencil size={11} />
      </button>
    </div>
  );
}

export default function AdminStopList({ puntos, onRemove, onRename }) {
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
          <span
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold flex-shrink-0",
              TIPO_COLOR[p.tipo],
            )}
          >
            {i + 1}
          </span>
          <div className="flex flex-1 flex-col min-w-0 gap-0.5">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground/60">
              {TIPO_LABEL[p.tipo]}
            </span>
            <NombreEditable punto={p} index={i} onRename={onRename} />
            {p.canton ? (
              <span className="text-[11px] text-muted-foreground truncate">
                {p.canton}, {p.provincia}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-amber-600 truncate">
                <MapPinOff size={10} />
                Ubicación sin verificar
              </span>
            )}
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