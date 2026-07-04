import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getPoligonoCanton } from "../../lib/geoCR";

delete L.Icon.Default.prototype._getIconUrl;

function makeIcon(color) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:28px;height:28px;border-radius:50% 50% 50% 0;
      background:${color};border:2px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
      transform:rotate(-45deg);cursor:grab;
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });
}

const ICONS = {
  origen: makeIcon("#16a34a"),
  parada: makeIcon("#2563eb"),
  destino: makeIcon("#dc2626"),
};

const CANTON_STYLE = {
  color: "#16a34a",
  weight: 2,
  opacity: 0.7,
  fillColor: "#16a34a",
  fillOpacity: 0.06,
  dashArray: "6 4",
};

const CR_CENTER = [9.9333, -84.0833];

function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function MapInvalidator() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

// Crea una capa de GeoJSON 

function CantonOverlay({ feature }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    const layer = L.geoJSON(null, {
      style: CANTON_STYLE,
      interactive: false,
    }).addTo(map);
    layerRef.current = layer;

    return () => {
      layer.remove();
      layerRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    layer.clearLayers();
    if (feature) {
      layer.addData(JSON.parse(JSON.stringify(feature)));
    }
  }, [feature]);

  return null;
}

export default function AdminMapPicker({
  modo,
  puntos,
  trazado,
  onMapClick,
  onPuntoMove,
  cantonOrigen,
}) {
  const [cantonPoligono, setCantonPoligono] = useState(null);

  const origen = puntos.find((p) => p.tipo === "origen");
  // Prioriza el canton escogido o donde esta el punto, si esta fuera del canton el punto de origen da error
  const cantonAMostrar = cantonOrigen || origen?.canton || null;

  useEffect(() => {
    let cancelado = false;
    if (!cantonAMostrar) {
      setCantonPoligono(null);
      return;
    }
    getPoligonoCanton(cantonAMostrar).then((feature) => {
      if (!cancelado) setCantonPoligono(feature);
    });
    return () => {
      cancelado = true;
    };
  }, [cantonAMostrar]);

  const polyline = trazado.length
    ? trazado.map((c) => [c.lat, c.lng])
    : puntos.map((p) => [p.lat, p.lng]);

  return (
    <div className="h-full w-full [&_.leaflet-container]:h-full [&_.leaflet-container]:w-full [&_.leaflet-container]:z-0">
      <MapContainer
        center={CR_CENTER}
        zoom={12}
        scrollWheelZoom={true}
        zoomSnap={0.3}
        zoomDelta={0.3}
        style={{ height: "100%", width: "100%" }}
      >
        <MapInvalidator />
        <ClickHandler onMapClick={onMapClick} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <CantonOverlay feature={cantonPoligono} />

        {polyline.length > 1 && (
          <Polyline
            positions={polyline}
            pathOptions={{ color: "#16a34a", weight: 4, opacity: 0.8 }}
          />
        )}

        {puntos.map((p, i) => (
          <Marker
            key={i}
            position={[p.lat, p.lng]}
            icon={ICONS[p.tipo]}
            draggable={true}
            eventHandlers={{
              dragend(e) {
                const { lat, lng } = e.target.getLatLng();
                onPuntoMove(i, { lat, lng });
              },
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}