import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTripRuntime } from "../hooks/useTripRuntime";

function formatDuration(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m.toString().padStart(2, "0")}:${r.toString().padStart(2, "0")}`;
}

export default function TripPanel() {
  const { t } = useTranslation();
  const {
    tripState,
    route,
    recipient,
    elapsedSec,
    estimatedRemainingSec,
    distanceTraveledKm,
    averageIsp,
    simulatePaused,
    pauseDurationSec,
    thresholds,
    forcePrealert,
    toggleSimulatedPause,
    triggerDeviation,
    arrive,
    cancelTrip,
  } = useTripRuntime();

  const [confirmingCancel, setConfirmingCancel] = useState<boolean>(false);

  const inProgress = tripState === "in_progress";
  const terminal =
    tripState === "completed" ||
    tripState === "cancelled" ||
    tripState === "alert";

  return (
    <section
      className="flex flex-col gap-3 overflow-y-auto border-b border-gray-200 bg-white p-4 lg:h-full lg:border-b-0 lg:border-r"
      aria-labelledby="trip-panel-heading"
    >
      <header>
        <h1 id="trip-panel-heading" className="text-xl font-bold text-gray-900">
          {t("trip.panel.heading")}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {recipient
            ? t("trip.panel.recipient", {
                name: recipient.name,
                kind: t(`trip.picker.badge${capitalize(recipient.kind)}`),
              })
            : t("trip.panel.noRecipient")}
        </p>
        <span
          className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadgeClass(tripState)}`}
        >
          {t(`trip.statuses.${tripState}`)}
        </span>
      </header>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <Metric
          label={t("trip.panel.elapsed")}
          value={formatDuration(elapsedSec)}
        />
        <Metric
          label={t("trip.panel.remaining")}
          value={formatDuration(estimatedRemainingSec)}
        />
        <Metric
          label={t("trip.panel.distanceTraveled")}
          value={t("route.metrics.distanceValue", {
            value: distanceTraveledKm.toFixed(2),
          })}
        />
        <Metric
          label={t("trip.panel.distanceTotal")}
          value={t("route.metrics.distanceValue", {
            value: route.distanceKm.toFixed(2),
          })}
        />
        <Metric label={t("trip.panel.averageIsp")} value={String(averageIsp)} />
        <Metric
          label={t("trip.panel.routeLabel")}
          value={t(`route.labels.${route.label}`, {
            defaultValue: route.label,
          })}
        />
      </dl>

      {simulatePaused && !terminal && (
        <div
          role="status"
          className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800"
        >
          {t("trip.panel.simulatedPauseActive", {
            seconds: pauseDurationSec,
            threshold: thresholds.pauseThresholdSec,
          })}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={arrive}
          disabled={terminal}
          className="min-h-tap w-full rounded bg-green-600 px-4 py-3 text-base font-semibold text-white shadow-sm hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-600 disabled:opacity-50"
        >
          {t("trip.panel.arrived")}
        </button>

        <button
          type="button"
          onClick={forcePrealert}
          disabled={!inProgress}
          className="min-h-tap w-full rounded border border-urjc-red px-4 py-2 text-sm font-semibold text-urjc-red hover:bg-urjc-red hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-urjc-red disabled:opacity-50"
        >
          {t("trip.panel.forcePrealert")}
        </button>

        <button
          type="button"
          onClick={toggleSimulatedPause}
          disabled={!inProgress}
          className="min-h-tap w-full rounded border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-urjc-red disabled:opacity-50"
        >
          {simulatePaused
            ? t("trip.panel.resumeMovement")
            : t("trip.panel.simulatePause")}
        </button>

        <button
          type="button"
          onClick={triggerDeviation}
          disabled={!inProgress}
          className="min-h-tap w-full rounded border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-urjc-red disabled:opacity-50"
        >
          {t("trip.panel.simulateDeviation")}
        </button>

        <button
          type="button"
          onClick={() => setConfirmingCancel(true)}
          disabled={terminal}
          className="min-h-tap w-full rounded px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-urjc-red disabled:opacity-50"
        >
          {t("trip.panel.cancel")}
        </button>
      </div>

      {confirmingCancel && (
        <ConfirmCancelDialog
          onKeep={() => setConfirmingCancel(false)}
          onConfirm={() => {
            setConfirmingCancel(false);
            cancelTrip();
          }}
        />
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wide text-gray-500">
        {label}
      </dt>
      <dd className="text-sm font-semibold text-gray-900">{value}</dd>
    </div>
  );
}

function capitalize(s: string): string {
  return s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1);
}

function statusBadgeClass(state: string): string {
  switch (state) {
    case "in_progress":
      return "bg-blue-100 text-blue-800";
    case "prealert":
      return "bg-amber-100 text-amber-800";
    case "alert":
      return "bg-red-100 text-red-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function ConfirmCancelDialog({
  onKeep,
  onConfirm,
}: {
  onKeep: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-dialog-title"
      className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/50 p-4"
    >
      <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
        <h2
          id="cancel-dialog-title"
          className="text-lg font-bold text-gray-900"
        >
          {t("trip.panel.confirmCancel.title")}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          {t("trip.panel.confirmCancel.message")}
        </p>
        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onKeep}
            className="min-h-tap rounded border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-urjc-red"
          >
            {t("trip.panel.confirmCancel.no")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="min-h-tap rounded bg-urjc-red px-4 py-2 text-sm font-semibold text-white hover:bg-urjc-red-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-urjc-red"
          >
            {t("trip.panel.confirmCancel.yes")}
          </button>
        </div>
      </div>
    </div>
  );
}
