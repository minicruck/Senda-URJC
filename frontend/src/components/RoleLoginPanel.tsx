import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Role } from "../types/incidents";
import RoleBadge from "./RoleBadge";

export interface RoleLoginPanelProps {
  onLoginAs: (role: Role) => Promise<void> | void;
  disabled?: boolean;
}

const ROLES: readonly Role[] = [
  "user",
  "admin",
  "security",
  "maintenance",
] as const;

export default function RoleLoginPanel({
  onLoginAs,
  disabled = false,
}: RoleLoginPanelProps) {
  const { t } = useTranslation();
  const [pendingRole, setPendingRole] = useState<Role | null>(null);

  const handleClick = async (role: Role): Promise<void> => {
    setPendingRole(role);
    try {
      await onLoginAs(role);
    } finally {
      setPendingRole(null);
    }
  };

  return (
    <section
      aria-labelledby="role-login-heading"
      className="mt-6 border-t border-gray-200 pt-4"
    >
      <h2
        id="role-login-heading"
        className="text-sm font-semibold text-gray-800"
      >
        {t("login.roles.heading")}
      </h2>
      <p className="mt-1 text-xs text-gray-500">
        {t("login.roles.description")}
      </p>

      <ul className="mt-3 flex flex-col gap-3">
        {ROLES.map((role: Role) => {
          const busy = pendingRole === role;
          return (
            <li key={role}>
              <button
                type="button"
                onClick={() => handleClick(role)}
                disabled={disabled || pendingRole !== null}
                aria-busy={busy}
                className="flex w-full items-center justify-between gap-3 rounded border border-gray-300 bg-white px-4 py-3 text-left text-sm font-medium text-gray-800 transition-colors hover:border-urjc-red hover:bg-urjc-red/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-urjc-red disabled:opacity-60"
              >
                <span className="flex-1">{t(`login.roles.as.${role}`)}</span>
                <span className="shrink-0">
                  <RoleBadge role={role} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
