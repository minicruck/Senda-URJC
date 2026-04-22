import { useTranslation } from "react-i18next";
import { useTripRuntime } from "../hooks/useTripRuntime";

export default function SecurityPanel() {
  const { t, i18n } = useTranslation();
  const { alertPayload, markAlertResolved, tripState } = useTripRuntime();

  if (!alertPayload) return null;

  const formattedDate = new Date(alertPayload.triggeredAt).toLocaleString(
    i18n.resolvedLanguage,
  );
  const reasonKey = `trip.prealert.reason${capitalize(alertPayload.triggerReason)}`;

  return (
    <section
      className="rounded-lg border-2 border-urjc-red bg-white shadow-sm"
      aria-labelledby="security-panel-heading"
    >
      <header className="rounded-t-md bg-urjc-red px-3 py-2 text-white">
        <h3
          id="security-panel-heading"
          className="text-sm font-bold uppercase tracking-wide"
        >
          {t("trip.security.heading")}
        </h3>
        <p className="text-xs">{t("trip.security.description")}</p>
      </header>

      <dl className="grid grid-cols-1 gap-2 p-3 text-xs text-gray-700 sm:grid-cols-2">
        <Field label={t("trip.security.user")} value={alertPayload.userName} />
        <Field
          label={t("trip.security.email")}
          value={alertPayload.userEmail}
        />
        <Field label={t("trip.security.reason")} value={t(reasonKey)} />
        <Field label={t("trip.security.triggeredAt")} value={formattedDate} />
        <Field
          label={t("trip.security.recipient")}
          value={
            alertPayload.recipient
              ? `${alertPayload.recipient.name} (${alertPayload.recipient.details})`
              : t("trip.security.noRecipient")
          }
        />
        <Field
          label={t("trip.security.routeLabel")}
          value={t(`route.labels.${alertPayload.routeLabel}`, {
            defaultValue: alertPayload.routeLabel,
          })}
        />
        <Field
          label={t("trip.security.lastLocation")}
          value={`${alertPayload.lastKnownLocation.lat.toFixed(5)}, ${alertPayload.lastKnownLocation.lng.toFixed(5)}`}
        />
        <Field
          label={t("trip.security.destination")}
          value={`${alertPayload.destination.lat.toFixed(5)}, ${alertPayload.destination.lng.toFixed(5)}`}
        />
      </dl>

      <footer className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-3 py-2">
        <p className="text-[10px] text-gray-500">
          {t("trip.security.waypointCount", {
            count: alertPayload.routeWaypoints.length,
          })}
        </p>
        <button
          type="button"
          onClick={markAlertResolved}
          disabled={tripState !== "alert"}
          className="min-h-tap rounded border border-urjc-red bg-white px-3 py-1 text-xs font-semibold text-urjc-red hover:bg-urjc-red hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-urjc-red disabled:opacity-50"
        >
          {tripState === "alert"
            ? t("trip.security.markResolved")
            : t("trip.security.resolved")}
        </button>
      </footer>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase text-gray-500">{label}</dt>
      <dd className="font-semibold text-gray-900 break-all">{value}</dd>
    </div>
  );
}

function capitalize(s: string): string {
  return s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1);
}
