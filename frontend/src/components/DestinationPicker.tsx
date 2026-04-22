import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { User } from "../auth/types";
import type { Contact, Recipient, Volunteer } from "../types/trip";
import { MOCK_VOLUNTEERS } from "../services/storage";

export interface DestinationPickerProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: (recipient: Recipient) => void;
  user: User;
  contacts: Contact[];
  storedVolunteers: Volunteer[];
}

export default function DestinationPicker({
  isOpen,
  onCancel,
  onConfirm,
  user,
  contacts,
  storedVolunteers,
}: DestinationPickerProps) {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  // Merge hardcoded + stored volunteers, filter out the current user to
  // prevent them from choosing themselves as companion.
  const volunteers = useMemo<Volunteer[]>(() => {
    const seen = new Set<string>();
    const merged: Volunteer[] = [];
    const all: Volunteer[] = [...MOCK_VOLUNTEERS, ...storedVolunteers];
    for (const v of all) {
      if (v.email === user.email) continue;
      if (seen.has(v.email)) continue;
      seen.add(v.email);
      merged.push(v);
    }
    return merged;
  }, [storedVolunteers, user.email]);

  // Reset selection and focus the cancel button on open.
  useEffect(() => {
    if (isOpen) {
      setSelectedId(null);
      window.setTimeout(() => cancelRef.current?.focus(), 0);
    }
  }, [isOpen]);

  // Escape to close.
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const handleConfirm = (): void => {
    if (!selectedId) return;
    const contact = contacts.find((c: Contact) => c.id === selectedId);
    if (contact) {
      onConfirm({
        id: contact.id,
        kind: "contact",
        name: contact.name,
        details: contact.phone,
      });
      return;
    }
    const volunteer = volunteers.find((v: Volunteer) => v.id === selectedId);
    if (volunteer) {
      onConfirm({
        id: volunteer.id,
        kind: "volunteer",
        name: volunteer.name,
        details: volunteer.email,
      });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="destination-picker-title"
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4"
    >
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        <header className="border-b border-gray-200 p-4">
          <h2
            id="destination-picker-title"
            className="text-lg font-bold text-gray-900"
          >
            {t("trip.picker.title")}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {t("trip.picker.subtitle")}
          </p>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          <section aria-labelledby="contacts-heading" className="mb-5">
            <h3
              id="contacts-heading"
              className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500"
            >
              {t("trip.picker.contactsHeading")}
            </h3>
            {contacts.length === 0 ? (
              <p className="text-sm text-gray-500">
                {t("trip.picker.noContacts")}
              </p>
            ) : (
              <ul className="flex flex-col gap-1">
                {contacts.map((c: Contact) => (
                  <RecipientRadio
                    key={c.id}
                    id={c.id}
                    name="recipient"
                    primary={c.name}
                    secondary={c.phone}
                    badge={t("trip.picker.badgeContact")}
                    checked={selectedId === c.id}
                    onSelect={() => setSelectedId(c.id)}
                  />
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="volunteers-heading">
            <h3
              id="volunteers-heading"
              className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500"
            >
              {t("trip.picker.volunteersHeading")}
            </h3>
            {volunteers.length === 0 ? (
              <p className="text-sm text-gray-500">
                {t("trip.picker.noVolunteers")}
              </p>
            ) : (
              <ul className="flex flex-col gap-1">
                {volunteers.map((v: Volunteer) => (
                  <RecipientRadio
                    key={v.id}
                    id={v.id}
                    name="recipient"
                    primary={v.name}
                    secondary={v.email}
                    badge={t("trip.picker.badgeVolunteer")}
                    checked={selectedId === v.id}
                    onSelect={() => setSelectedId(v.id)}
                  />
                ))}
              </ul>
            )}
          </section>
        </div>

        <footer className="flex flex-col-reverse gap-2 border-t border-gray-200 bg-gray-50 p-4 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="min-h-tap rounded border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-urjc-red"
          >
            {t("trip.picker.cancel")}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedId}
            className="min-h-tap rounded bg-urjc-red px-4 py-2 text-sm font-semibold text-white hover:bg-urjc-red-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-urjc-red disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("trip.picker.startTrip")}
          </button>
        </footer>
      </div>
    </div>
  );
}

interface RecipientRadioProps {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  badge: string;
  checked: boolean;
  onSelect: () => void;
}

function RecipientRadio({
  id,
  name,
  primary,
  secondary,
  badge,
  checked,
  onSelect,
}: RecipientRadioProps) {
  return (
    <li>
      <label
        className={`flex min-h-tap cursor-pointer items-center gap-3 rounded border px-3 py-2 transition-colors ${
          checked
            ? "border-urjc-red bg-urjc-red/5"
            : "border-gray-200 hover:bg-gray-50"
        }`}
      >
        <input
          type="radio"
          name={name}
          value={id}
          checked={checked}
          onChange={onSelect}
          className="h-4 w-4 text-urjc-red focus:ring-urjc-red"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">
              {primary}
            </span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-gray-600">
              {badge}
            </span>
          </div>
          <p className="text-xs text-gray-500">{secondary}</p>
        </div>
      </label>
    </li>
  );
}
