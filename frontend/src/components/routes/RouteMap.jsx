import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
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

export default function MapaRutas({ coordenadasRecorrido = [], paradas = [] }) {
  const polylinePositions = coordenadasRecorrido.map((c) => [c.lat, c.lng]);

  return (
    <div className="relative h-[400px] w-full overflow-hidden rounded-lg border border-border shadow-sm sm:h-[500px] [&_.leaflet-container]:h-full [&_.leaflet-container]:w-full [&_.leaflet-container]:z-0">
      <MapContainer
        center={CR_CENTER}
        zoom={CR_ZOOM}
        scrollWheelZoom={true}
        zoomSnap={0.3}
        zoomDelta={0.3}
      >
        <MapInvalidator />
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
          <Marker key={index} position={[parada.lat, parada.lng]}>
            <Tooltip>
              <span className="text-xs font-semibold">{parada.nombre}</span>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}