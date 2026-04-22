import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";

export default function TopBar() {
  const { t } = useTranslation();
  const { isAuthenticated, logout } = useAuth();

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

        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `min-h-tap hidden rounded px-3 py-2 text-sm font-semibold hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:inline-flex sm:items-center ${
                  isActive ? "bg-white text-urjc-red" : "text-white"
                }`
              }
            >
              {t("nav.profile")}
            </NavLink>
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
    </header>
  );
}
