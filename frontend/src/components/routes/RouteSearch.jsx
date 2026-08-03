import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import LocationSelect from "../ui/LocationSelect";
import TarjetaRuta from "./RouteCard";
import useRoutes from "../../hooks/useRoutes";

export default function BuscadorRutas({ onSelectRuta, rutaSeleccionadaId }) {
  const [origen, setOrigen] = useState({ provincia: "", canton: "" });
  const [destino, setDestino] = useState({ provincia: "", canton: "" });
  const { resultados, buscar, loading, error, buscado } = useRoutes();

  function handleBuscar() {
    buscar({
      provincia_origen: origen.provincia,
      canton_origen: origen.canton,
      provincia_destino: destino.provincia,
      canton_destino: destino.canton,
    });
  }

  useEffect(() => {
    if (resultados.length > 0) onSelectRuta?.(resultados[0]);
  }, [resultados]);

  return (
    <div>
      <Card>
        <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-foreground">
          <Search size={18} className="text-primary" />
          Buscar tu ruta
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:items-end">
          <LocationSelect
            label="Origen"
            placeholder="Provincia o cantón"
            value={origen}
            onChange={setOrigen}
          />
          <LocationSelect
            label="Destino"
            placeholder="Provincia o cantón"
            value={destino}
            onChange={setDestino}
          />
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
              <TarjetaRuta
                key={ruta.id}
                ruta={ruta}
                onClick={onSelectRuta}
                seleccionada={ruta.id === rutaSeleccionadaId}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
