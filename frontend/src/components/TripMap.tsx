import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import L, { type LatLngBounds, type LatLngExpression } from "leaflet";
import { useTranslation } from "react-i18next";
import CoverageCircles from "./CoverageCircles";
import { useTripRuntime } from "../hooks/useTripRuntime";
import type { LatLng, SafetyLevel } from "../types/route";

const SAFETY_COLOR: Record<SafetyLevel, string> = {
  high: "#16A34A",
  medium: "#EAB308",
  low: "#DC2626",
};

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
});
const destinationIcon = L.divIcon({
  className: "senda-marker",
  html: renderPin("#C00000", "D"),
  iconSize: [30, 42],
  iconAnchor: [15, 42],
});

/**
 * Pulsing user position icon — a filled circle with an animated ring,
 * generated entirely from inline SVG + CSS so no binary assets are shipped.
 */
const userIcon = L.divIcon({
  className: "senda-user-marker",
  html: `
    <div style="position:relative;width:28px;height:28px;">
      <span style="position:absolute;inset:0;border-radius:9999px;background:#C00000;opacity:0.25;animation:senda-pulse 1.6s ease-out infinite;"></span>
      <span style="position:absolute;inset:6px;border-radius:9999px;background:#C00000;border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,0.2);"></span>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export default function TripMap() {
  const { t } = useTranslation();
  const { route, currentPosition, traveledPath } = useTripRuntime();

  const routePositions = useMemo<LatLngExpression[]>(
    () => route.waypoints.map((p: LatLng): [number, number] => [p.lat, p.lng]),
    [route.waypoints],
  );
  const traveledPositions = useMemo<LatLngExpression[]>(
    () => traveledPath.map((p: LatLng): [number, number] => [p.lat, p.lng]),
    [traveledPath],
  );

  const origin = route.waypoints[0];
  const destination = route.waypoints[route.waypoints.length - 1];
  const initialCenter: LatLngExpression = [origin.lat, origin.lng];

  return (
    <MapContainer
      center={initialCenter}
      zoom={16}
      scrollWheelZoom
      className="h-full w-full"
      aria-label={t("trip.map.label")}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <CoverageCircles />

      <Polyline
        positions={routePositions}
        pathOptions={{
          color: SAFETY_COLOR[route.safetyLevel],
          weight: 6,
          opacity: 0.85,
        }}
      />
      {traveledPositions.length > 1 && (
        <Polyline
          positions={traveledPositions}
          pathOptions={{
            color: "#111827",
            weight: 4,
            opacity: 0.9,
            dashArray: "2 6",
          }}
        />
      )}

      <Marker position={[origin.lat, origin.lng]} icon={originIcon}>
        <Tooltip direction="top" offset={[0, -36]}>
          {t("route.origin.label")}
        </Tooltip>
      </Marker>
      <Marker
        position={[destination.lat, destination.lng]}
        icon={destinationIcon}
      >
        <Tooltip direction="top" offset={[0, -36]}>
          {t("route.destination.label")}
        </Tooltip>
      </Marker>

      <Marker
        position={[currentPosition.lat, currentPosition.lng]}
        icon={userIcon}
        zIndexOffset={1000}
      >
        <Tooltip direction="top" offset={[0, -16]}>
          {t("trip.map.youAreHere")}
        </Tooltip>
      </Marker>

      <FitInitial waypoints={route.waypoints} />
      <FollowUser position={currentPosition} />
    </MapContainer>
  );
}

function FitInitial({ waypoints }: { waypoints: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    const sizing = window.setTimeout(() => map.invalidateSize(), 100);
    if (waypoints.length >= 2) {
      const bounds: LatLngBounds = L.latLngBounds(
        waypoints.map((p: LatLng): [number, number] => [p.lat, p.lng]),
      );
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
    }
    return () => window.clearTimeout(sizing);
  }, [map, waypoints]);
  return null;
}

function FollowUser({ position }: { position: LatLng }) {
  const map = useMap();
  useEffect(() => {
    // Keep the user marker within the current viewport without forcing
    // a zoom change — if the user pans manually we don't fight them.
    const pt = map.latLngToContainerPoint([position.lat, position.lng]);
    const size = map.getSize();
    const margin = 80;
    const outside =
      pt.x < margin ||
      pt.x > size.x - margin ||
      pt.y < margin ||
      pt.y > size.y - margin;
    if (outside) {
      map.panTo([position.lat, position.lng], { animate: true });
    }
  }, [position, map]);
  return null;
}
