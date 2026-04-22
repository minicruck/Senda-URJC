import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  RoutePlannerProvider,
  useRoutePlanner,
} from "../hooks/useRoutePlanner";
import AddressSearchInput from "../components/AddressSearchInput";
import RouteMap from "../components/RouteMap";
import RouteList from "../components/RouteList";
import type { EndpointKind } from "../types/route";

export default function RouteRequestPage() {
  return (
    <RoutePlannerProvider>
      <RouteRequestScreen />
    </RoutePlannerProvider>
  );
}

function RouteRequestScreen() {
  const { t } = useTranslation();
  const {
    origin,
    destination,
    nextEndpoint,
    routes,
    activeRouteId,
    errorKey,
    setEndpoint,
    setNextEndpoint,
    clearEndpoint,
    computeRoutes,
    chooseRoute,
    clearError,
  } = useRoutePlanner();

  const [geolocating, setGeolocating] = useState(false);
  const [localErrorKey, setLocalErrorKey] = useState<string | null>(null);

  const displayErrorKey = errorKey ?? localErrorKey;

  // Auto-dismiss the error banner after a few seconds.
  useEffect(() => {
    if (!displayErrorKey) return undefined;
    const timeout = window.setTimeout(() => {
      clearError();
      setLocalErrorKey(null);
    }, 6000);
    return () => window.clearTimeout(timeout);
  }, [displayErrorKey, clearError]);

  const handleUseCurrentLocation = (): void => {
    if (!("geolocation" in navigator)) {
      setLocalErrorKey("errors.geolocationUnavailable");
      return;
    }
    setGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeolocating(false);
        setEndpoint("origin", {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => {
        setGeolocating(false);
        setLocalErrorKey(
          err.code === err.PERMISSION_DENIED
            ? "errors.geolocationDenied"
            : "errors.geolocationFailed",
        );
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  const canCompute = origin !== null && destination !== null;
  const hasRoutes = routes.length > 0;

  return (
    <section className="flex flex-1 flex-col lg:flex-row">
      <aside className="flex w-full flex-col gap-4 border-b border-gray-200 bg-white p-4 lg:w-[380px] lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <header>
          <h1 className="text-xl font-bold text-gray-900">
            {t("route.heading")}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {t("route.instructions")}
          </p>
        </header>

        <AddressSearchInput
          kind="origin"
          value={origin}
          onSelect={(s) => setEndpoint("origin", s.point)}
          onClear={() => clearEndpoint("origin")}
          onRequestUseCurrentLocation={handleUseCurrentLocation}
          geolocating={geolocating}
        />

        <AddressSearchInput
          kind="destination"
          value={destination}
          onSelect={(s) => setEndpoint("destination", s.point)}
          onClear={() => clearEndpoint("destination")}
        />

        <EndpointToggle value={nextEndpoint} onChange={setNextEndpoint} />

        {displayErrorKey && (
          <div
            role="alert"
            className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
          >
            {t(displayErrorKey)}
          </div>
        )}

        <button
          type="button"
          onClick={computeRoutes}
          disabled={!canCompute}
          className="inline-flex min-h-tap w-full items-center justify-center rounded bg-urjc-red px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-urjc-red-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-urjc-red disabled:cursor-not-allowed disabled:opacity-50"
        >
          {hasRoutes ? t("route.recomputeCta") : t("route.computeCta")}
        </button>

        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {t("route.list.heading")}
          </h2>
          <RouteList
            routes={routes}
            activeRouteId={activeRouteId}
            onChoose={chooseRoute}
          />
        </section>
      </aside>

      <div className="relative h-[60vh] min-h-[400px] w-full flex-shrink-0 lg:h-auto lg:flex-1 lg:flex-shrink">
        <RouteMap />
      </div>
    </section>
  );
}

function EndpointToggle({
  value,
  onChange,
}: {
  value: EndpointKind;
  onChange: (k: EndpointKind) => void;
}) {
  const { t } = useTranslation();
  const options: { value: EndpointKind; labelKey: string }[] = [
    { value: "origin", labelKey: "route.toggle.placeOrigin" },
    { value: "destination", labelKey: "route.toggle.placeDestination" },
  ];

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {t("route.toggle.heading")}
      </span>
      <div
        role="group"
        aria-label={t("route.toggle.heading")}
        className="inline-flex overflow-hidden rounded border border-gray-300 bg-white"
      >
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              aria-pressed={selected}
              className={`min-h-tap flex-1 px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-urjc-red ${
                selected
                  ? "bg-urjc-red text-white"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {t(opt.labelKey)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
