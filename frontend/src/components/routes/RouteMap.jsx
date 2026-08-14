import { useEffect, useRef, useState, useCallback } from "react";
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
import { LocateFixed, Navigation } from "lucide-react";

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

const UBICACION_USUARIO_ICON = L.divIcon({
  className: "",
  html: `
    <div style="position:relative;width:18px;height:18px;">
      <div style="position:absolute;inset:-9px;border-radius:9999px;background:rgba(37,99,235,0.25);animation:pulso-ubicacion 1.8s ease-out infinite;"></div>
      <div style="position:absolute;inset:0;border-radius:9999px;background:#2563eb;border:2px solid white;box-shadow:0 0 2px rgba(0,0,0,0.4);"></div>
    </div>
    <style>
      @keyframes pulso-ubicacion {
        0% { transform: scale(0.6); opacity: 0.8; }
        100% { transform: scale(1.8); opacity: 0; }
      }
    </style>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const CR_CENTER = [9.9333, -84.0833];
const CR_ZOOM = 12;
const ZOOM_SEGUIMIENTO = 16;

function MapInvalidator() {
  const map = useMap();
  useEffect(() => {
    const timeout = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(timeout);
  }, [map]);
  return null;
}

function MapaAutoFit({ puntos, rutaKey, banderaAutoMovimiento }) {
  const map = useMap();
  const ultimaRutaEncuadrada = useRef(null);
  const usuarioInteractuo = useRef(false);

  useEffect(() => {
    const marcarInteraccion = () => {
      if (!banderaAutoMovimiento.current) {
        usuarioInteractuo.current = true;
      }
    };
    map.on("zoomstart", marcarInteraccion);
    map.on("dragstart", marcarInteraccion);
    return () => {
      map.off("zoomstart", marcarInteraccion);
      map.off("dragstart", marcarInteraccion);
    };
  }, [map, banderaAutoMovimiento]);

  useEffect(() => {
    if (!puntos || puntos.length === 0) return;
    if (ultimaRutaEncuadrada.current === rutaKey) return;
    if (usuarioInteractuo.current) return;

    banderaAutoMovimiento.current = true;
    map.invalidateSize();

    requestAnimationFrame(() => {
      if (puntos.length === 1) {
        map.setView(puntos[0], 14);
      } else {
        const bounds = L.latLngBounds(puntos);
        map.fitBounds(bounds, { padding: [40, 40] });
      }
      setTimeout(() => {
        banderaAutoMovimiento.current = false;
      }, 0);
    });

    ultimaRutaEncuadrada.current = rutaKey;
  }, [map, puntos, rutaKey, banderaAutoMovimiento]);

  return null;
}

function SeguidorBus({
  busPosicion,
  siguiendo,
  onInterrupcionManual,
  banderaAutoMovimiento,
}) {
  const map = useMap();

  useEffect(() => {
    const detectarDragManual = () => {
      if (banderaAutoMovimiento.current) return;
      onInterrupcionManual();
    };
    map.on("dragstart", detectarDragManual);
    return () => map.off("dragstart", detectarDragManual);
  }, [map, onInterrupcionManual, banderaAutoMovimiento]);

  useEffect(() => {
    if (!siguiendo || !busPosicion) return;

    banderaAutoMovimiento.current = true;
    const destino = [busPosicion.lat, busPosicion.lng];

    if (map.getZoom() < ZOOM_SEGUIMIENTO) {
      map.setView(destino, ZOOM_SEGUIMIENTO, { animate: true });
    } else {
      map.panTo(destino, { animate: true });
    }

    const t = setTimeout(() => {
      banderaAutoMovimiento.current = false;
    }, 300);
    return () => clearTimeout(t);
  }, [siguiendo, busPosicion, map, banderaAutoMovimiento]);

  return null;
}

function BotonSeguirBus({ siguiendo, onToggle, disabled }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={siguiendo}
      className={`absolute bottom-4 right-4 z-[1000] flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold shadow-md backdrop-blur transition-colors ${
        siguiendo
          ? "border-green-600 bg-green-600 text-white hover:bg-green-700"
          : "border-border bg-background/95 text-foreground hover:bg-muted"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      {siguiendo ? (
        <Navigation className="h-4 w-4 animate-pulse" />
      ) : (
        <LocateFixed className="h-4 w-4" />
      )}
      {siguiendo ? "Siguiendo bus" : "Seguir bus"}
    </button>
  );
}

export default function MapaRutas({
  coordenadasRecorrido = [],
  paradas = [],
  onSelectParada,
  busPosicion = null,
  mostrarSeguimiento = false,
  ubicacionUsuario = null,
}) {
  const [siguiendoBus, setSiguiendoBus] = useState(false);
  const banderaAutoMovimiento = useRef(false);

  const polylinePositions = coordenadasRecorrido.map((c) => [c.lat, c.lng]);

  const puntosParaEncuadrar =
    polylinePositions.length > 1
      ? polylinePositions
      : paradas.map((p) => [p.lat, p.lng]);

  const rutaKey =
    (paradas.map((p) => p.id ?? `${p.lat},${p.lng}`).join("|") ||
      "sin-paradas") + `::${puntosParaEncuadrar.length}`;

  const handleToggleSeguir = useCallback(() => {
    setSiguiendoBus((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!mostrarSeguimiento) setSiguiendoBus(false);
  }, [mostrarSeguimiento]);

  const handleInterrupcionManual = useCallback(() => {
    setSiguiendoBus(false);
  }, []);

  return (
    <div className="relative h-[400px] w-full max-w-full overflow-hidden rounded-lg border border-border shadow-sm sm:h-[500px] [&_.leaflet-container]:h-full [&_.leaflet-container]:w-full [&_.leaflet-container]:z-0">
      <MapContainer
        center={CR_CENTER}
        zoom={CR_ZOOM}
        scrollWheelZoom
        zoomSnap={0.3}
        zoomDelta={0.3}
      >
        <MapInvalidator />
        <MapaAutoFit
          puntos={puntosParaEncuadrar}
          rutaKey={rutaKey}
          banderaAutoMovimiento={banderaAutoMovimiento}
        />
        {mostrarSeguimiento && (
          <SeguidorBus
            busPosicion={busPosicion}
            siguiendo={siguiendoBus}
            onInterrupcionManual={handleInterrupcionManual}
            banderaAutoMovimiento={banderaAutoMovimiento}
          />
        )}
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
                <p className="text-xs capitalize text-muted-foreground">
                  {parada.tipo}
                </p>
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

        {ubicacionUsuario && (
          <Marker
            position={[ubicacionUsuario.lat, ubicacionUsuario.lng]}
            icon={UBICACION_USUARIO_ICON}
            zIndexOffset={900}
          >
            <Tooltip direction="top" offset={[0, -8]} permanent={false}>
              <span className="text-xs font-semibold">Tu ubicación</span>
            </Tooltip>
          </Marker>
        )}
      </MapContainer>

      {mostrarSeguimiento && (
        <BotonSeguirBus
          siguiendo={siguiendoBus}
          onToggle={handleToggleSeguir}
          disabled={!busPosicion}
        />
      )}
    </div>
  );
}