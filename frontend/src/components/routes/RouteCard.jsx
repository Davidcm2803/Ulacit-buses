import { useNavigate } from "react-router-dom";
import { Clock, MapPin, Route as RouteIcon } from "lucide-react";
import Card from "../ui/Card";

export default function TarjetaRuta({ ruta }) {
  const navigate = useNavigate();

  return (
    <Card
      className="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md"
      onClick={() => navigate(`/rutas/${ruta.id}`)}
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
    </Card>
  );
}