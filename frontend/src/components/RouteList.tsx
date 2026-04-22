import { useTranslation } from "react-i18next";
import type { Route, SafetyLevel } from "../types/route";

export interface RouteListProps {
  routes: Route[];
  activeRouteId: string | null;
  onChoose: (routeId: string) => void;
}

const SAFETY_BADGE: Record<SafetyLevel, string> = {
  high: "bg-green-100 text-green-800 border-green-300",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  low: "bg-red-100 text-red-800 border-red-300",
};

const SAFETY_DOT: Record<SafetyLevel, string> = {
  high: "bg-[#16A34A]",
  medium: "bg-[#EAB308]",
  low: "bg-[#DC2626]",
};

export default function RouteList({
  routes,
  activeRouteId,
  onChoose,
}: RouteListProps) {
  const { t } = useTranslation();

  if (routes.length === 0) {
    return (
      <div className="rounded border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-600">
        {t("route.list.empty")}
      </div>
    );
  }

  return (
    <ol className="flex flex-col gap-2">
      {routes.map((route, index) => {
        const active = route.id === activeRouteId;
        const label = t(`route.labels.${route.label}`, {
          defaultValue: route.label,
        });
        return (
          <li key={route.id}>
            <article
              className={`rounded-lg border bg-white p-3 shadow-sm transition-colors ${
                active
                  ? "border-urjc-red ring-2 ring-urjc-red/30"
                  : "border-gray-200"
              }`}
            >
              <header className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500">
                    #{index + 1}
                  </span>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {label}
                  </h3>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${SAFETY_BADGE[route.safetyLevel]}`}
                >
                  <span
                    aria-hidden
                    className={`inline-block h-2 w-2 rounded-full ${SAFETY_DOT[route.safetyLevel]}`}
                  />
                  {t(`route.safety.${route.safetyLevel}`)}
                </span>
              </header>

              <dl className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-600">
                <div>
                  <dt className="text-[10px] uppercase text-gray-500">
                    {t("route.metrics.isp")}
                  </dt>
                  <dd className="font-semibold text-gray-900">{route.isp}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase text-gray-500">
                    {t("route.metrics.distance")}
                  </dt>
                  <dd className="font-semibold text-gray-900">
                    {t("route.metrics.distanceValue", {
                      value: route.distanceKm.toFixed(2),
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase text-gray-500">
                    {t("route.metrics.duration")}
                  </dt>
                  <dd className="font-semibold text-gray-900">
                    {t("route.metrics.durationValue", {
                      value: Math.max(1, Math.round(route.durationMin)),
                    })}
                  </dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={() => onChoose(route.id)}
                aria-pressed={active}
                className={`mt-3 inline-flex min-h-tap w-full items-center justify-center rounded px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-urjc-red ${
                  active
                    ? "bg-urjc-red text-white hover:bg-urjc-red-dark"
                    : "border border-urjc-red text-urjc-red hover:bg-urjc-red hover:text-white"
                }`}
              >
                {active ? t("route.list.selected") : t("route.list.choose")}
              </button>
            </article>
          </li>
        );
      })}
    </ol>
  );
}
