import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { AlertRecord } from "../types/incidents";

export interface AlertsTableProps {
  alerts: AlertRecord[];
  onResolve?: (id: string) => void;
  emptyKey: string;
}

export default function AlertsTable({
  alerts,
  onResolve,
  emptyKey,
}: AlertsTableProps) {
  const { t, i18n } = useTranslation();
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.resolvedLanguage, {
        dateStyle: "short",
        timeStyle: "medium",
      }),
    [i18n.resolvedLanguage],
  );

  if (alerts.length === 0) {
    return (
      <div className="rounded border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-600">
        {t(emptyKey)}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <ul className="divide-y divide-gray-200">
        {alerts.map((alert: AlertRecord) => {
          const active = alert.status === "active";
          return (
            <li key={alert.id} className="p-3 sm:p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {alert.userName}
                  </p>
                  <p className="text-[11px] text-gray-500">{alert.userEmail}</p>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    active
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {t(`alerts.status.${alert.status}`)}
                </span>
              </div>

              <dl className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-700 sm:grid-cols-3">
                <div>
                  <dt className="text-[10px] uppercase text-gray-500">
                    {t("alerts.reason")}
                  </dt>
                  <dd className="font-semibold text-gray-900">
                    {t(`alerts.reasons.${alert.reason}`)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase text-gray-500">
                    {t("alerts.triggeredAt")}
                  </dt>
                  <dd className="font-semibold text-gray-900">
                    {dateFormatter.format(new Date(alert.triggeredAt))}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase text-gray-500">
                    {t("alerts.recipient")}
                  </dt>
                  <dd className="font-semibold text-gray-900">
                    {alert.recipientName ?? t("alerts.noRecipient")}
                  </dd>
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <dt className="text-[10px] uppercase text-gray-500">
                    {t("alerts.location")}
                  </dt>
                  <dd className="font-semibold text-gray-900 break-all">
                    {alert.location.lat.toFixed(5)},{" "}
                    {alert.location.lng.toFixed(5)}
                  </dd>
                </div>
              </dl>

              {onResolve && active && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => onResolve(alert.id)}
                    className="min-h-tap rounded border border-green-600 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-600 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
                  >
                    {t("alerts.actions.resolve")}
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
