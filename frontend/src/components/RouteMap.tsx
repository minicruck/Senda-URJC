import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L, { type LatLngBounds, type LatLngExpression } from "leaflet";
import { useTranslation } from "react-i18next";
import CoverageCircles from "./CoverageCircles";
import { useRoutePlanner } from "../hooks/useRoutePlanner";
import type { LatLng, Route, SafetyLevel } from "../types/route";

const MOSTOLES_CAMPUS: LatLngExpression = [40.336, -3.875];
const DEFAULT_ZOOM = 15;

const SAFETY_COLOR: Record<SafetyLevel, string> = {
  high: "#16A34A",
  medium: "#EAB308",
  low: "#DC2626",
};

/**
 * Renders a teardrop-style pin as inline SVG. Avoids shipping the default
 * Leaflet PNG assets, which don't resolve automatically in Vite bundles.
 */
function renderPin(color: string, letter: string): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 42" width="30" height="42" aria-hidden="true">
      <path d="M15 0C6.7 0 0 6.7 0 15c0 10.6 13.3 25.5 13.9 26.1a1.5 1.5 0 0 0 2.2 0C16.7 40.5 30 25.6 30 15 30 6.7 23.3 0 15 0Z" fill="${color}" stroke="white" stroke-width="2"/>
      <text x="15" y="20" text-anchor="middle" fill="white" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700">${letter}</text>
    </svg>
  `;
}

const originIcon = L.divIcon({
  className: "senda-marker",
  html: renderPin("#16A34A", "O"),
  iconSize: [30, 42],
  iconAnchor: [15, 42],
  popupAnchor: [0, -36],
});

const destinationIcon = L.divIcon({
  className: "senda-marker",
  html: renderPin("#C00000", "D"),
  iconSize: [30, 42],
  iconAnchor: [15, 42],
  popupAnchor: [0, -36],
});

export default function RouteMap() {
  const { t } = useTranslation();
  const {
    origin,
    destination,
    routes,
    activeRouteId,
    nextEndpoint,
    setEndpoint,
  } = useRoutePlanner();

  return (
    <MapContainer
      center={MOSTOLES_CAMPUS}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom
      className="h-full w-full"
      aria-label={t("route.map.label")}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      <CoverageCircles />

      <ClickHandler
        onClick={(latlng) => {
          setEndpoint(nextEndpoint, { lat: latlng.lat, lng: latlng.lng });
        }}
      />

      {origin && (
        <Marker position={[origin.lat, origin.lng]} icon={originIcon}>
          <Tooltip direction="top" offset={[0, -36]}>
            {t("route.origin.label")}
          </Tooltip>
        </Marker>
      )}
      {destination && (
        <Marker
          position={[destination.lat, destination.lng]}
          icon={destinationIcon}
        >
          <Tooltip direction="top" offset={[0, -36]}>
            {t("route.destination.label")}
          </Tooltip>
        </Marker>
      )}

      {routes.map((route) => (
        <RoutePolyline
          key={route.id}
          route={route}
          active={route.id === activeRouteId}
        />
      ))}

      <AutoBoundsFitter />
    </MapContainer>
  );
}

function ClickHandler({ onClick }: { onClick: (latlng: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
}

function RoutePolyline({ route, active }: { route: Route; active: boolean }) {
  const positions: LatLngExpression[] = route.waypoints.map((p: LatLng) => [
    p.lat,
    p.lng,
  ]);
  return (
    <Polyline
      positions={positions}
      pathOptions={{
        color: SAFETY_COLOR[route.safetyLevel],
        weight: active ? 7 : 4,
        opacity: active ? 1 : 0.55,
        dashArray: active ? undefined : "8 6",
      }}
    />
  );
}

/**
 * Recenters / re-zooms the map as the relevant geometry changes.
 * Also calls invalidateSize() once on mount to handle flex-container
 * initial sizing quirks.
 */
function AutoBoundsFitter() {
  const map = useMap();
  const { origin, destination, routes, activeRouteId } = useRoutePlanner();

  useEffect(() => {
    const timer = window.setTimeout(() => map.invalidateSize(), 100);
    return () => window.clearTimeout(timer);
  }, [map]);

  const bounds = useMemo<LatLngBounds | null>(() => {
    const active = routes.find((r) => r.id === activeRouteId);
    if (active) {
      return L.latLngBounds(
        active.waypoints.map((p: LatLng) => [p.lat, p.lng] as [number, number]),
      );
    }
    if (origin && destination) {
      return L.latLngBounds([
        [origin.lat, origin.lng],
        [destination.lat, destination.lng],
      ]);
    }
    return null;
  }, [origin, destination, routes, activeRouteId]);

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
    } else if (origin) {
      map.setView([origin.lat, origin.lng], 17);
    } else if (destination) {
      map.setView([destination.lat, destination.lng], 17);
    }
  }, [bounds, map, origin, destination]);

  return null;
}
