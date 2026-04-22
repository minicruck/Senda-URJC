import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";
import RoleBadge from "./RoleBadge";
import type { Role } from "../types/incidents";

interface NavItem {
  to: string;
  key: string;
}

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  user: [
    { to: "/", key: "nav.home" },
    { to: "/profile", key: "nav.profile" },
    { to: "/incidents/new", key: "nav.reportIncident" },
  ],
  admin: [
    { to: "/admin", key: "nav.admin" },
    { to: "/stats", key: "nav.stats" },
  ],
  security: [{ to: "/security", key: "nav.securityService" }],
  maintenance: [{ to: "/maintenance", key: "nav.maintenanceService" }],
};

export default function TopBar() {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const navItems: NavItem[] = user ? NAV_BY_ROLE[user.role] : [];

  return (
    <header className="bg-urjc-red text-white shadow">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between gap-2 px-4">
        <Link
          to="/"
          className="flex items-center gap-2 rounded px-1 py-1 text-lg font-semibold hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <span
            aria-hidden
            className="inline-flex h-9 w-9 items-center justify-center rounded bg-white text-base font-bold text-urjc-red"
          >
            SU
          </span>
          <span className="hidden sm:inline">{t("app.title")}</span>
        </Link>

        <nav
          className="hidden flex-1 items-center justify-center gap-1 md:flex"
          aria-label={t("nav.primary")}
        >
          {navItems.map((item: NavItem) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `min-h-tap rounded px-3 py-2 text-sm font-semibold hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  isActive ? "bg-white text-urjc-red" : "text-white"
                }`
              }
            >
              {t(item.key)}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user && (
            <div className="hidden items-center gap-2 text-xs sm:flex">
              <span className="max-w-[10rem] truncate text-white/90">
                {user.displayName}
              </span>
              <RoleBadge role={user.role} variant="inverted" />
            </div>
          )}
          <LanguageSwitcher />
          {isAuthenticated && (
            <button
              type="button"
              onClick={logout}
              className="min-h-tap min-w-tap rounded border border-white/40 px-3 py-2 text-sm font-semibold hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {t("nav.logout")}
            </button>
          )}
        </div>
      </div>

      {navItems.length > 0 && (
        <nav
          className="flex overflow-x-auto border-t border-white/20 md:hidden"
          aria-label={t("nav.primary")}
        >
          {navItems.map((item: NavItem) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `min-h-tap flex-1 whitespace-nowrap px-3 py-2 text-center text-xs font-semibold ${
                  isActive
                    ? "bg-white text-urjc-red"
                    : "text-white/90 hover:bg-white/10"
                }`
              }
            >
              {t(item.key)}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
