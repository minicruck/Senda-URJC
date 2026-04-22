import { useTranslation } from "react-i18next";
import type { IncidentCategory } from "../types/incidents";
import { INCIDENT_CATEGORIES } from "../types/incidents";

export interface IncidentCategoryPickerProps {
  value: IncidentCategory | null;
  onChange: (category: IncidentCategory) => void;
}

const CATEGORY_COLORS: Record<IncidentCategory, string> = {
  lighting: "border-yellow-300 bg-yellow-50 text-yellow-900",
  feeling: "border-purple-300 bg-purple-50 text-purple-900",
  obstacle: "border-orange-300 bg-orange-50 text-orange-900",
  accessibility: "border-blue-300 bg-blue-50 text-blue-900",
};

const CATEGORY_ICONS: Record<IncidentCategory, string> = {
  lighting: `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M9 21h6v-2H9v2Zm3-19a7 7 0 0 0-4 12.7V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.3A7 7 0 0 0 12 2Z"/></svg>`,
  feeling: `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 5a2 2 0 1 1-2 2 2 2 0 0 1 2-2Zm4 12H8v-1c0-2 2.7-3 4-3s4 1 4 3Z"/></svg>`,
  obstacle: `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M12 2 1 21h22Zm0 6 7.5 13h-15Zm-1 4v4h2v-4Zm0 6v2h2v-2Z"/></svg>`,
  accessibility: `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M12 2a2 2 0 1 1-2 2 2 2 0 0 1 2-2Zm7 7-5 1v4l3 6-2 1-3-6H9l-1 6H6l1-7 1-5 3-1h3l5-1Z"/></svg>`,
};

export default function IncidentCategoryPicker({
  value,
  onChange,
}: IncidentCategoryPickerProps) {
  const { t } = useTranslation();

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-gray-800">
        {t("incident.categoryHeading")}
      </legend>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {INCIDENT_CATEGORIES.map((cat: IncidentCategory) => {
          const selected = cat === value;
          return (
            <li key={cat}>
              <label
                className={`flex min-h-tap cursor-pointer items-start gap-3 rounded-lg border-2 p-3 text-sm transition-colors ${
                  selected
                    ? `${CATEGORY_COLORS[cat]} ring-2 ring-urjc-red`
                    : "border-gray-200 bg-white text-gray-800 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="incident-category"
                  value={cat}
                  checked={selected}
                  onChange={() => onChange(cat)}
                  className="mt-0.5 h-4 w-4 text-urjc-red focus:ring-urjc-red"
                />
                <span className="flex flex-1 items-start gap-2">
                  <span
                    aria-hidden
                    className={selected ? "" : "text-gray-400"}
                    dangerouslySetInnerHTML={{ __html: CATEGORY_ICONS[cat] }}
                  />
                  <span className="flex flex-col">
                    <span className="font-semibold">
                      {t(`incident.categories.${cat}.label`)}
                    </span>
                    <span className="text-xs text-gray-600">
                      {t(`incident.categories.${cat}.hint`)}
                    </span>
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
