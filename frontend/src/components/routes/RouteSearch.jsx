import { useState } from "react";
import { Search } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import SelectField from "../ui/SelectField";
import TarjetaRuta from "./RouteCard";
import useRoutes from "../../hooks/useRoutes";

const CANTONES = ["San José", "Heredia", "Alajuela", "Cartago", "Escazú"];

export default function BuscadorRutas({ onSelectRuta }) {
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const { resultados, buscar, loading, error, buscado } = useRoutes();

  function handleBuscar() {
    buscar({ origen, destino });
  }

  return (
    <div>
      <Card>
        <h2 className="mb-6 text-lg font-semibold text-foreground">Buscar tu ruta</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:items-end">
          <SelectField label="Origen" value={origen} onChange={setOrigen} options={CANTONES} />
          <SelectField label="Destino" value={destino} onChange={setDestino} options={CANTONES} />
          <Button block onClick={handleBuscar} disabled={loading}>
            <Search size={16} />
            {loading ? "Buscando..." : "Buscar ruta"}
          </Button>
        </div>
      </Card>

      {error && (
        <p className="mt-4 text-sm text-red-500">No se pudo buscar: {error}</p>
      )}

      {buscado && !loading && resultados.length === 0 && !error && (
        <p className="mt-6 text-sm text-muted-foreground">
          No hay rutas para ese origen/destino.
        </p>
      )}

      {resultados.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-6 text-lg font-semibold text-foreground">
            Rutas disponibles
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resultados.map((ruta) => (
              <TarjetaRuta key={ruta.id} ruta={ruta} onClick={onSelectRuta} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}