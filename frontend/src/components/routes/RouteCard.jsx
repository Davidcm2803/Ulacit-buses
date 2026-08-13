import { useNavigate } from "react-router-dom";
import { Clock, MapPin, Route as RouteIcon, ArrowRight } from "lucide-react";
import Card from "../ui/Card";

export default function TarjetaRuta({ ruta, onClick, seleccionada = false }) {
  const navigate = useNavigate();

  function handleCardClick() {
    if (onClick) onClick(ruta);
    else navigate(`/rutas/${ruta.id}`);
  }

  function handleVerDetalles(e) {
    e.stopPropagation();
    navigate(`/rutas/${ruta.id}`);
  }

  return (
    <Card
      className={`cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${
        seleccionada ? "ring-2 ring-primary" : ""
      }`}
      onClick={handleCardClick}
    >
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">
            {ruta.codigo}
          </span>
          <span className="text-lg font-semibold text-foreground">{ruta.nombre}</span>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-bold text-primary">
            ₡{Number(ruta.tarifa).toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">por persona</div>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin size={16} />
        <span>{ruta.canton_origen} → {ruta.canton_destino}</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock size={16} />
            <span>{ruta.primer_bus} - {ruta.ultimo_bus}</span>
          </div>
          {ruta.distancia_km != null && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RouteIcon size={16} />
              <span>{ruta.distancia_km} km · {ruta.tiempo_min} min</span>
            </div>
          )}
        </div>

        {onClick && (
          <button
            type="button"
            onClick={handleVerDetalles}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            Detalles <ArrowRight size={12} />
          </button>
        )}
      </div>
    </Card>
  );
}