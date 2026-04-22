import { useTranslation } from "react-i18next";
import type { Volunteer } from "../types/trip";
import type { User } from "../auth/types";

export interface VolunteerToggleProps {
  user: User;
  storedVolunteers: Volunteer[];
  onChange: (next: Volunteer[]) => void;
}

export default function VolunteerToggle({
  user,
  storedVolunteers,
  onChange,
}: VolunteerToggleProps) {
  const { t } = useTranslation();
  const active = storedVolunteers.some(
    (v: Volunteer) => v.email === user.email,
  );

  const handleToggle = (): void => {
    if (active) {
      onChange(
        storedVolunteers.filter((v: Volunteer) => v.email !== user.email),
      );
    } else {
      onChange([
        ...storedVolunteers,
        { id: `vol-${user.id}`, name: user.displayName, email: user.email },
      ]);
    }
  };

  return (
    <section
      aria-labelledby="volunteer-heading"
      className="flex flex-col gap-3"
    >
      <header>
        <h2
          id="volunteer-heading"
          className="text-lg font-semibold text-gray-900"
        >
          {t("profile.volunteer.heading")}
        </h2>
        <p className="text-sm text-gray-600">
          {t("profile.volunteer.description")}
        </p>
      </header>

      <div
        className={`flex items-center justify-between gap-3 rounded border p-4 ${
          active ? "border-urjc-red bg-urjc-red/5" : "border-gray-200 bg-white"
        }`}
      >
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {active
              ? t("profile.volunteer.active")
              : t("profile.volunteer.inactive")}
          </p>
          <p className="mt-1 text-xs text-gray-600">
            {active
              ? t("profile.volunteer.activeDescription")
              : t("profile.volunteer.inactiveDescription")}
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          aria-pressed={active}
          className={`min-h-tap shrink-0 rounded px-4 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-urjc-red ${
            active
              ? "bg-white text-urjc-red border border-urjc-red hover:bg-urjc-red hover:text-white"
              : "bg-urjc-red text-white hover:bg-urjc-red-dark"
          }`}
        >
          {active
            ? t("profile.volunteer.toggleOff")
            : t("profile.volunteer.toggleOn")}
        </button>
      </div>
    </section>
  );
}
