import { useTranslation } from "react-i18next";
import type { Role } from "../types/incidents";

export interface RoleBadgeProps {
  role: Role;
  variant?: "inverted" | "default";
}

const BASE_CLASSES =
  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide";

const DEFAULT_CLASSES: Record<Role, string> = {
  user: "bg-blue-100 text-blue-800",
  admin: "bg-purple-100 text-purple-800",
  security: "bg-red-100 text-red-800",
  maintenance: "bg-amber-100 text-amber-800",
};

const INVERTED_CLASSES = "bg-white/15 text-white border border-white/30";

export default function RoleBadge({
  role,
  variant = "default",
}: RoleBadgeProps) {
  const { t } = useTranslation();
  const classes =
    variant === "inverted" ? INVERTED_CLASSES : DEFAULT_CLASSES[role];
  return (
    <span className={`${BASE_CLASSES} ${classes}`}>{t(`roles.${role}`)}</span>
  );
}
