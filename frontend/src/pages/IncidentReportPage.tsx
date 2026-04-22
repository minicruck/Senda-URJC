import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L, { type LatLngExpression } from "leaflet";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import CoverageCircles from "../components/CoverageCircles";
import IncidentReportModal from "../components/IncidentReportModal";
import type { LatLng } from "../types/route";
import { isWithinCoverage } from "../services/coverage";

const MOSTOLES_CAMPUS: LatLngExpression = [40.336, -3.875];

const pinIcon = L.divIcon({
  className: "senda-incident-pin",
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 42" width="30" height="42" aria-hidden="true">
      <path d="M15 0C6.7 0 0 6.7 0 15c0 10.6 13.3 25.5 13.9 26.1a1.5 1.5 0 0 0 2.2 0C16.7 40.5 30 25.6 30 15 30 6.7 23.3 0 15 0Z" fill="#C00000" stroke="white" stroke-width="2"/>
      <text x="15" y="20" text-anchor="middle" fill="white" font-family="system-ui, sans-serif" font-size="14" font-weight="700">!</text>
    </svg>
  `,
  iconSize: [30, 42],
  iconAnchor: [15, 42],
});

export default function IncidentReportPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selected, setSelected] = useState<LatLng | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [geolocating, setGeolocating] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (!errorKey) return undefined;
    const timeout = window.setTimeout(() => setErrorKey(null), 6000);
    return () => window.clearTimeout(timeout);
  }, [errorKey]);

  if (!user) return <Navigate to="/login" replace />;

  const handleMapPick = (point: LatLng): void => {
    if (!isWithinCoverage(point)) {
      setErrorKey("errors.outOfCoverage");
      return;
    }
    setSelected(point);
    setErrorKey(null);
  };

  const handleUseCurrentLocation = (): void => {
    if (!("geolocation" in navigator)) {
      setErrorKey("errors.geolocationUnavailable");
      return;
    }
    setGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeolocating(false);
        handleMapPick({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => {
        setGeolocating(false);
        setErrorKey(
          err.code === err.PERMISSION_DENIED
            ? "errors.geolocationDenied"
            : "errors.geolocationFailed",
        );
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  return (
    <section className="flex flex-1 flex-col gap-3 p-4 lg:mx-auto lg:w-full lg:max-w-4xl lg:p-6">
      <header>
        <h1 className="text-xl font-bold text-gray-900">
          {t("incident.page.heading")}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {t("incident.page.description")}
        </p>
      </header>

      <div className="flex flex-col gap-2 rounded border border-gray-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-700">
          {selected
            ? t("incident.page.selectedLocation", {
                lat: selected.lat.toFixed(5),
                lng: selected.lng.toFixed(5),
              })
            : t("incident.page.pickHint")}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={geolocating}
            className="min-h-tap rounded border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-urjc-red disabled:opacity-60"
          >
            {t("route.useCurrentLocation")}
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            disabled={!selected}
            className="min-h-tap rounded bg-urjc-red px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-urjc-red-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-urjc-red disabled:opacity-50"
          >
            {t("incident.page.continue")}
          </button>
        </div>
      </div>

      {errorKey && (
        <div
          role="alert"
          className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {t(errorKey)}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800"
        >
          {t("incident.page.success")}
        </div>
      )}

      <div className="h-[60vh] min-h-[400px] w-full flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 lg:h-auto lg:flex-1 lg:flex-shrink">
        <MapContainer
          center={MOSTOLES_CAMPUS}
          zoom={15}
          scrollWheelZoom
          className="h-full w-full"
          aria-label={t("incident.page.mapLabel")}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          <CoverageCircles />
          <MapClickHandler onPick={handleMapPick} />
          {selected && (
            <>
              <Marker position={[selected.lat, selected.lng]} icon={pinIcon} />
              <PanTo point={selected} />
            </>
          )}
        </MapContainer>
      </div>

      {selected && (
        <IncidentReportModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          user={user}
          fixedLocation={selected}
          onSubmitted={() => {
            setSuccess(true);
            setSelected(null);
            window.setTimeout(() => navigate("/"), 1500);
          }}
        />
      )}
    </section>
  );
}

function MapClickHandler({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function PanTo({ point }: { point: LatLng }) {
  const map = useMap();
  useEffect(() => {
    map.panTo([point.lat, point.lng], { animate: true });
  }, [point, map]);
  return null;
}
