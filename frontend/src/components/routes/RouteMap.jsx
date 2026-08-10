import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Tooltip,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const SHADOW_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png";

function crearIcono(color) {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: SHADOW_URL,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}

const ICONOS = {
  origen: crearIcono("green"),
  destino: crearIcono("red"),
  parada: crearIcono("blue"),
};

const BUS_ICON = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f68c.png",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const CR_CENTER = [9.9333, -84.0833];
const CR_ZOOM = 12;

function MapInvalidator() {
  const map = useMap();
  useEffect(() => {
    const timeout = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(timeout);
  }, [map]);
  return null;
}

function MapaAutoFit({ puntos }) {
  const map = useMap();

  useEffect(() => {
    if (!puntos || puntos.length === 0) return;

    if (puntos.length === 1) {
      map.setView(puntos[0], 14);
      return;
    }

    const bounds = L.latLngBounds(puntos);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, puntos]);

  return null;
}

export default function MapaRutas({
  coordenadasRecorrido = [],
  paradas = [],
  onSelectParada,
  busPosicion = null,
}) {
  const polylinePositions = coordenadasRecorrido.map((c) => [c.lat, c.lng]);

  const puntosParaEncuadrar =
    polylinePositions.length > 1
      ? polylinePositions
      : paradas.map((p) => [p.lat, p.lng]);

  return (
    <div className="relative h-[400px] w-full overflow-hidden rounded-lg border border-border shadow-sm sm:h-[500px] [&_.leaflet-container]:h-full [&_.leaflet-container]:w-full [&_.leaflet-container]:z-0">
      <MapContainer center={CR_CENTER} zoom={CR_ZOOM} scrollWheelZoom zoomSnap={0.3} zoomDelta={0.3}>
        <MapInvalidator />
        <MapaAutoFit puntos={puntosParaEncuadrar} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {polylinePositions.length > 1 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{ color: "#16a34a", weight: 4, opacity: 0.8 }}
          />
        )}

        {paradas.map((parada, index) => (
          <Marker
            key={parada.id ?? index}
            position={[parada.lat, parada.lng]}
            icon={ICONOS[parada.tipo] ?? ICONOS.parada}
            eventHandlers={{
              click: () => onSelectParada?.(parada),
            }}
          >
            <Tooltip>
              <span className="text-xs font-semibold">{parada.nombre}</span>
            </Tooltip>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{parada.nombre}</p>
                <p className="text-xs capitalize text-muted-foreground">{parada.tipo}</p>
                <p className="text-xs text-muted-foreground">
                  {parada.canton}, {parada.provincia}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {busPosicion && (
          <Marker
            position={[busPosicion.lat, busPosicion.lng]}
            icon={BUS_ICON}
            zIndexOffset={1000}
          >
            <Tooltip direction="top" offset={[0, -10]} permanent={false}>
              <span className="text-xs font-semibold">Tu bus</span>
            </Tooltip>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}