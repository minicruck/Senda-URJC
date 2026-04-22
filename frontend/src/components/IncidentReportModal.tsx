import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { IncidentCategory, Ticket } from "../types/incidents";
import type { LatLng } from "../types/route";
import type { User } from "../auth/types";
import IncidentCategoryPicker from "./IncidentCategoryPicker";
import { useTickets } from "../services/tickets";
import { isWithinCoverage } from "../services/coverage";

export interface IncidentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: (ticket: Ticket) => void;
  user: User;
  fixedLocation: LatLng;
  locationLabel?: string;
}

const MAX_DESCRIPTION = 280;

export default function IncidentReportModal({
  isOpen,
  onClose,
  onSubmitted,
  user,
  fixedLocation,
  locationLabel,
}: IncidentReportModalProps) {
  const { t } = useTranslation();
  const { create } = useTickets();
  const [category, setCategory] = useState<IncidentCategory | null>(null);
  const [description, setDescription] = useState<string>("");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCategory(null);
      setDescription("");
      setErrorKey(null);
      window.setTimeout(() => closeRef.current?.focus(), 0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (): void => {
    if (!category) {
      setErrorKey("incident.errors.missingCategory");
      return;
    }
    if (!isWithinCoverage(fixedLocation)) {
      setErrorKey("errors.outOfCoverage");
      return;
    }
    setSubmitting(true);
    try {
      const ticket = create({
        user,
        category,
        description: description.trim() || undefined,
        location: fixedLocation,
      });
      onSubmitted?.(ticket);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const coords = `${fixedLocation.lat.toFixed(5)}, ${fixedLocation.lng.toFixed(5)}`;
  const remaining = MAX_DESCRIPTION - description.length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="incident-modal-title"
      className="fixed inset-0 z-[2300] flex items-center justify-center bg-black/50 p-4"
    >
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        <header className="border-b border-gray-200 p-4">
          <h2
            id="incident-modal-title"
            className="text-lg font-bold text-gray-900"
          >
            {t("incident.modal.title")}
          </h2>
          <p className="mt-1 text-xs text-gray-600">
            {t("incident.modal.subtitle")}
          </p>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <IncidentCategoryPicker value={category} onChange={setCategory} />

          <div>
            <label
              htmlFor="incident-desc"
              className="mb-1 block text-sm font-semibold text-gray-800"
            >
              {t("incident.descriptionLabel")}
            </label>
            <textarea
              id="incident-desc"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value.slice(0, MAX_DESCRIPTION))
              }
              rows={3}
              placeholder={t("incident.descriptionPlaceholder")}
              className="w-full rounded border border-gray-300 bg-white p-2 text-sm focus:border-urjc-red focus:outline-none focus-visible:ring-2 focus-visible:ring-urjc-red"
            />
            <p className="mt-1 text-right text-[10px] text-gray-500">
              {t("incident.charsRemaining", { value: remaining })}
            </p>
          </div>

          <div className="rounded border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700">
            <p className="font-semibold uppercase text-gray-500">
              {t("incident.locationLabel")}
            </p>
            <p className="mt-1 break-all">{locationLabel ?? coords}</p>
            {locationLabel && (
              <p className="mt-1 text-[10px] text-gray-500">{coords}</p>
            )}
          </div>

          {errorKey && (
            <div
              role="alert"
              className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
            >
              {t(errorKey)}
            </div>
          )}
        </div>

        <footer className="flex flex-col-reverse gap-2 border-t border-gray-200 bg-gray-50 p-4 sm:flex-row sm:justify-end">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="min-h-tap rounded border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-urjc-red"
          >
            {t("incident.cancel")}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="min-h-tap rounded bg-urjc-red px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-urjc-red-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-urjc-red disabled:opacity-60"
          >
            {t("incident.submit")}
          </button>
        </footer>
      </div>
    </div>
  );
}
