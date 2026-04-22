import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Thresholds } from "../types/trip";
import {
  DEVIATION_THRESHOLD_RANGE,
  PAUSE_THRESHOLD_RANGE,
  clampNumber,
} from "../services/storage";

export interface ThresholdsEditorProps {
  thresholds: Thresholds;
  onChange: (next: Thresholds) => void;
}

export default function ThresholdsEditor({
  thresholds,
  onChange,
}: ThresholdsEditorProps) {
  const { t } = useTranslation();
  const [saveHint, setSaveHint] = useState<boolean>(false);

  const commit = (next: Thresholds): void => {
    onChange(next);
    setSaveHint(true);
    window.setTimeout(() => setSaveHint(false), 1500);
  };

  const onPauseChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = clampNumber(
      Number.parseInt(e.target.value, 10),
      PAUSE_THRESHOLD_RANGE.min,
      PAUSE_THRESHOLD_RANGE.max,
    );
    commit({ ...thresholds, pauseThresholdSec: value });
  };

  const onDeviationChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = clampNumber(
      Number.parseInt(e.target.value, 10),
      DEVIATION_THRESHOLD_RANGE.min,
      DEVIATION_THRESHOLD_RANGE.max,
    );
    commit({ ...thresholds, deviationThresholdMeters: value });
  };

  return (
    <section
      aria-labelledby="thresholds-heading"
      className="flex flex-col gap-3"
    >
      <header>
        <h2
          id="thresholds-heading"
          className="text-lg font-semibold text-gray-900"
        >
          {t("profile.thresholds.heading")}
        </h2>
        <p className="text-sm text-gray-600">
          {t("profile.thresholds.description")}
        </p>
      </header>

      <div className="flex flex-col gap-4 rounded border border-gray-200 bg-white p-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-800">
          <span className="flex items-baseline justify-between">
            <span>{t("profile.thresholds.pause.label")}</span>
            <span className="text-xs tabular-nums text-urjc-red">
              {t("profile.thresholds.seconds", {
                value: thresholds.pauseThresholdSec,
              })}
            </span>
          </span>
          <input
            type="range"
            min={PAUSE_THRESHOLD_RANGE.min}
            max={PAUSE_THRESHOLD_RANGE.max}
            step={5}
            value={thresholds.pauseThresholdSec}
            onChange={onPauseChange}
            aria-valuemin={PAUSE_THRESHOLD_RANGE.min}
            aria-valuemax={PAUSE_THRESHOLD_RANGE.max}
            aria-valuenow={thresholds.pauseThresholdSec}
            className="accent-urjc-red"
          />
          <span className="text-xs text-gray-500">
            {t("profile.thresholds.pause.description")}
          </span>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-gray-800">
          <span className="flex items-baseline justify-between">
            <span>{t("profile.thresholds.deviation.label")}</span>
            <span className="text-xs tabular-nums text-urjc-red">
              {t("profile.thresholds.meters", {
                value: thresholds.deviationThresholdMeters,
              })}
            </span>
          </span>
          <input
            type="range"
            min={DEVIATION_THRESHOLD_RANGE.min}
            max={DEVIATION_THRESHOLD_RANGE.max}
            step={5}
            value={thresholds.deviationThresholdMeters}
            onChange={onDeviationChange}
            aria-valuemin={DEVIATION_THRESHOLD_RANGE.min}
            aria-valuemax={DEVIATION_THRESHOLD_RANGE.max}
            aria-valuenow={thresholds.deviationThresholdMeters}
            className="accent-urjc-red"
          />
          <span className="text-xs text-gray-500">
            {t("profile.thresholds.deviation.description")}
          </span>
        </label>

        {saveHint && (
          <p role="status" className="text-xs text-green-700">
            {t("profile.thresholds.saved")}
          </p>
        )}
      </div>
    </section>
  );
}
