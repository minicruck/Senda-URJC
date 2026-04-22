import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { AnomalyKind } from "../types/trip";

export interface PrealertModalProps {
  open: boolean;
  anomalyKind: AnomalyKind | null;
  remainingSec: number;
  onConfirmOk: () => void;
  onEscalate: () => void;
}

export default function PrealertModal({
  open,
  anomalyKind,
  remainingSec,
  onConfirmOk,
  onEscalate,
}: PrealertModalProps) {
  const { t } = useTranslation();
  const okRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => okRef.current?.focus(), 0);
      // Best-effort haptic feedback (RF-26). No-op where unsupported.
      if ("vibrate" in navigator) {
        try {
          navigator.vibrate([200, 120, 200]);
        } catch {
          /* ignore */
        }
      }
    }
  }, [open]);

  if (!open) return null;

  const reasonKey: string =
    anomalyKind === "pause"
      ? "trip.prealert.reasonPause"
      : anomalyKind === "deviation"
        ? "trip.prealert.reasonDeviation"
        : "trip.prealert.reasonManual";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="prealert-title"
      aria-describedby="prealert-description"
      className="fixed inset-0 z-[2500] flex items-center justify-center bg-black/70 p-4"
    >
      <div className="flex w-full max-w-md flex-col rounded-lg bg-white shadow-2xl">
        <div className="rounded-t-lg bg-urjc-red px-5 py-4 text-white">
          <h2 id="prealert-title" className="text-xl font-bold">
            {t("trip.prealert.title")}
          </h2>
        </div>
        <div className="px-5 py-4">
          <p id="prealert-description" className="text-base text-gray-800">
            {t("trip.prealert.message")}
          </p>
          <p className="mt-2 text-sm text-gray-600">{t(reasonKey)}</p>

          <div
            aria-live="assertive"
            aria-atomic="true"
            className="mt-4 flex items-center justify-center rounded bg-red-50 py-3 text-center"
          >
            <span className="text-3xl font-bold tabular-nums text-urjc-red">
              {remainingSec.toString().padStart(2, "0")}
            </span>
            <span className="ml-2 text-sm font-medium text-urjc-red-dark">
              {t("trip.prealert.countdownLabel")}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2 px-5 pb-5 sm:flex-row">
          <button
            ref={okRef}
            type="button"
            onClick={onConfirmOk}
            className="min-h-tap flex-1 rounded bg-green-600 px-4 py-3 text-base font-semibold text-white shadow-sm hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-600"
          >
            {t("trip.prealert.imOk")}
          </button>
          <button
            type="button"
            onClick={onEscalate}
            className="min-h-tap flex-1 rounded bg-urjc-red px-4 py-3 text-base font-semibold text-white shadow-sm hover:bg-urjc-red-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-urjc-red"
          >
            {t("trip.prealert.askHelp")}
          </button>
        </div>
      </div>
    </div>
  );
}
