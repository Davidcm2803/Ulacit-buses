import { useNavigate } from "react-router-dom";
import { Clock, MapPin } from "lucide-react";
import Card from "../ui/Card";

export default function TarjetaRuta({ ruta }) {
  const navigate = useNavigate();

  return (
    <Card
      className="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md"
      onClick={() => navigate(`/rutas/${ruta.id}`)}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">
            {ruta.numero}
          </span>
          <span className="text-lg font-semibold text-foreground">{ruta.nombre}</span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">
            {"\u20A1"}
            {ruta.precio.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">por persona</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock size={16} />
          <span>Salida: {ruta.horaSalida}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin size={16} />
          <span>{ruta.paradas.length} paradas</span>
        </div>
      </div>
    </Card>
  );
}
