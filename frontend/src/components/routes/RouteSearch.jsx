import { useState } from "react";
import { Search } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import SelectField from "../ui/SelectField";
import TarjetaRuta from "./RouteCard";
import useRutas from "../../hooks/useRoutes";

const ORIGENES = ["San Jose", "Heredia", "Alajuela", "Cartago"];
const DESTINOS = ["San Jose", "Heredia", "Alajuela", "Cartago"];

export default function BuscadorRutas() {
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const { resultados, buscar } = useRutas();

  function handleBuscar() {
    buscar({ origen, destino });
  }

  return (
    <div>
      <Card>
        <h2 className="mb-6 text-lg font-semibold text-foreground">Buscar tu ruta</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:items-end">
          <SelectField
            label="Origen"
            value={origen}
            onChange={setOrigen}
            options={ORIGENES}
          />
          <SelectField
            label="Destino"
            value={destino}
            onChange={setDestino}
            options={DESTINOS}
          />
          <Button block onClick={handleBuscar}>
            <Search size={16} />
            Buscar ruta
          </Button>
        </div>
      </Card>

      {resultados.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-6 text-lg font-semibold text-foreground">
            Rutas disponibles
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resultados.map((ruta) => (
              <TarjetaRuta key={ruta.id} ruta={ruta} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
