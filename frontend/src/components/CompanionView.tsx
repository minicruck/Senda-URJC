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
import { useTripRuntime } from "../hooks/useTripRuntime";
import type { LatLng } from "../types/route";

const companionUserIcon = L.divIcon({
  className: "senda-companion-user",
  html: `
    <div style="width:20px;height:20px;border-radius:9999px;background:#C00000;border:3px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,0.2);"></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export default function CompanionView() {
  const { t } = useTranslation();
  const { route, currentPosition, recipient, tripState, elapsedSec } =
    useTripRuntime();

  const routePositions = useMemo<LatLngExpression[]>(
    () => route.waypoints.map((p: LatLng): [number, number] => [p.lat, p.lng]),
    [route.waypoints],
  );

  const origin = route.waypoints[0];
  const initialCenter: LatLngExpression = [origin.lat, origin.lng];
  const isAlert = tripState === "alert";

  return (
    <article
      className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
      aria-labelledby="companion-heading"
    >
      <header className="border-b border-gray-200 bg-gray-50 px-3 py-2">
        <h3
          id="companion-heading"
          className="text-sm font-semibold text-gray-900"
        >
          {t("trip.companion.heading")}
        </h3>
        <p className="text-xs text-gray-500">
          {recipient
            ? t("trip.companion.sharingWith", { name: recipient.name })
            : t("trip.companion.noRecipient")}
        </p>
      </header>

      <div className="relative h-56 w-full">
        <MapContainer
          center={initialCenter}
          zoom={16}
          scrollWheelZoom={false}
          zoomControl={false}
          className="h-full w-full"
          aria-label={t("trip.companion.mapLabel")}
        >
          <TileLayer
            attribution="&copy; OSM"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          <Polyline
            positions={routePositions}
            pathOptions={{ color: "#C00000", weight: 5, opacity: 0.8 }}
          />
          <Marker
            position={[currentPosition.lat, currentPosition.lng]}
            icon={companionUserIcon}
          >
            <Tooltip direction="top" offset={[0, -10]} permanent>
              {t("trip.companion.label")}
            </Tooltip>
          </Marker>
          <CompanionBoundsOnce waypoints={route.waypoints} />
          <CompanionFollow position={currentPosition} />
        </MapContainer>
      </div>

      <dl className="grid grid-cols-2 gap-2 p-3 text-xs text-gray-600">
        <div>
          <dt className="text-[10px] uppercase text-gray-500">
            {t("trip.companion.lastUpdate")}
          </dt>
          <dd className="font-semibold text-gray-900">
            {t("trip.values.secondsAgo", { value: Math.floor(elapsedSec) })}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase text-gray-500">
            {t("trip.companion.status")}
          </dt>
          <dd
            className={`font-semibold ${isAlert ? "text-urjc-red" : "text-gray-900"}`}
          >
            {t(`trip.statuses.${tripState}`)}
          </dd>
        </div>
      </dl>

      {isAlert && (
        <div
          role="alert"
          className="border-t border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800"
        >
          {t("trip.companion.alertReceived")}
        </div>
      )}
    </article>
  );
}

function CompanionBoundsOnce({ waypoints }: { waypoints: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    const sizing = window.setTimeout(() => map.invalidateSize(), 100);
    if (waypoints.length >= 2) {
      const bounds: LatLngBounds = L.latLngBounds(
        waypoints.map((p: LatLng): [number, number] => [p.lat, p.lng]),
      );
      map.fitBounds(bounds, { padding: [20, 20], maxZoom: 17 });
    }
    return () => window.clearTimeout(sizing);
    // We deliberately do this only once on mount; later moves happen via CompanionFollow.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);
  return null;
}

function CompanionFollow({ position }: { position: LatLng }) {
  const map = useMap();
  useEffect(() => {
    map.panTo([position.lat, position.lng], { animate: true });
  }, [position, map]);
  return null;
}
