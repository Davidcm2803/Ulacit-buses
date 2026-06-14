import { MapPin, Clock, Route, Activity } from "lucide-react";

function SummaryItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon size={14} />
        {label}
      </div>
      <span className="text-sm font-medium text-foreground">{value ?? "—"}</span>
    </div>
  );
}

export default function AdminRouteSummary({ puntos, distanciaKm, tiempoMin }) {
  const paradas = puntos.filter((p) => p.tipo === "parada").length;
  const total   = puntos.length;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold text-foreground">Resumen de la ruta</h3>
      <SummaryItem icon={MapPin}   label="Total de puntos"     value={total} />
      <SummaryItem icon={MapPin}   label="Paradas intermedias" value={paradas} />
      <SummaryItem icon={Route}    label="Distancia aprox."    value={distanciaKm ? `${distanciaKm} km` : null} />
      <SummaryItem icon={Clock}    label="Tiempo estimado"     value={tiempoMin ? `${tiempoMin} min` : null} />
      <SummaryItem icon={Activity} label="Estado"              value="Activa" />
    </div>
  );
}