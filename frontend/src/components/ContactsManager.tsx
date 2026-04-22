import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Contact } from "../types/trip";

export interface ContactsManagerProps {
  contacts: Contact[];
  onChange: (next: Contact[]) => void;
}

function newId(): string {
  return `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function ContactsManager({
  contacts,
  onChange,
}: ContactsManagerProps) {
  const { t } = useTranslation();
  const [draftName, setDraftName] = useState<string>("");
  const [draftPhone, setDraftPhone] = useState<string>("");
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const handleAdd = (): void => {
    const name = draftName.trim();
    const phone = draftPhone.trim();
    if (name.length < 2 || phone.length < 4) {
      setErrorKey("profile.contacts.invalid");
      return;
    }
    const next: Contact[] = [...contacts, { id: newId(), name, phone }];
    onChange(next);
    setDraftName("");
    setDraftPhone("");
    setErrorKey(null);
  };

  const handleRemove = (id: string): void => {
    onChange(contacts.filter((c: Contact) => c.id !== id));
  };

  return (
    <section
      aria-labelledby="contacts-section-heading"
      className="flex flex-col gap-3"
    >
      <header>
        <h2
          id="contacts-section-heading"
          className="text-lg font-semibold text-gray-900"
        >
          {t("profile.contacts.heading")}
        </h2>
        <p className="text-sm text-gray-600">
          {t("profile.contacts.description")}
        </p>
      </header>

      {contacts.length === 0 ? (
        <p className="rounded border border-dashed border-gray-300 bg-white p-3 text-sm text-gray-600">
          {t("profile.contacts.empty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {contacts.map((c: Contact) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-3 rounded border border-gray-200 bg-white p-3"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                <p className="text-xs text-gray-500">{c.phone}</p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(c.id)}
                aria-label={t("profile.contacts.removeAria", { name: c.name })}
                className="min-h-tap min-w-tap rounded border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-red-50 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-urjc-red"
              >
                {t("profile.contacts.remove")}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="grid grid-cols-1 gap-2 rounded border border-gray-200 bg-gray-50 p-3 sm:grid-cols-[1fr_1fr_auto]">
        <label className="flex flex-col gap-1 text-xs font-medium text-gray-700">
          <span>{t("profile.contacts.name")}</span>
          <input
            type="text"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            className="min-h-tap rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:border-urjc-red focus:outline-none focus-visible:ring-2 focus-visible:ring-urjc-red"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-gray-700">
          <span>{t("profile.contacts.phone")}</span>
          <input
            type="tel"
            value={draftPhone}
            onChange={(e) => setDraftPhone(e.target.value)}
            className="min-h-tap rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:border-urjc-red focus:outline-none focus-visible:ring-2 focus-visible:ring-urjc-red"
          />
        </label>
        <button
          type="button"
          onClick={handleAdd}
          className="min-h-tap self-end rounded bg-urjc-red px-4 py-2 text-sm font-semibold text-white hover:bg-urjc-red-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-urjc-red"
        >
          {t("profile.contacts.add")}
        </button>
      </div>
      {errorKey && <p className="text-xs text-red-600">{t(errorKey)}</p>}
    </section>
  );
}
