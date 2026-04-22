import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import RoleLoginPanel from "../components/RoleLoginPanel";
import type { Role } from "../types/incidents";
import { rolePath } from "../types/incidents";

interface LocationState {
  from?: { pathname: string };
}

export default function LoginPage() {
  const { t } = useTranslation();
  const { isAuthenticated, user, login, loginAs } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState<boolean>(false);

  if (isAuthenticated && user) {
    const state = location.state as LocationState | null;
    const fallback = rolePath(user.role);
    const destination = state?.from?.pathname ?? fallback;
    return <Navigate to={destination} replace />;
  }

  const redirectAfterLogin = (role: Role): void => {
    const state = location.state as LocationState | null;
    const fallback = rolePath(role);
    const destination = state?.from?.pathname ?? fallback;
    navigate(destination, { replace: true });
  };

  const handleLogin = async (): Promise<void> => {
    setLoading(true);
    try {
      await login();
      redirectAfterLogin("user");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleLogin = async (role: Role): Promise<void> => {
    setLoading(true);
    try {
      await loginAs(role);
      redirectAfterLogin(role);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex flex-1 items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          {t("login.heading")}
        </h1>
        <p className="mt-2 text-gray-600">{t("login.description")}</p>

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          aria-busy={loading}
          className="mt-6 inline-flex min-h-tap w-full items-center justify-center rounded bg-urjc-red px-4 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-urjc-red-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-urjc-red disabled:opacity-60"
        >
          {loading ? t("login.loading") : t("login.button")}
        </button>

        <p className="mt-4 text-center text-xs text-gray-500">
          {t("login.mockNotice")}
        </p>

        <RoleLoginPanel onLoginAs={handleRoleLogin} disabled={loading} />
      </div>
    </section>
  );
}
