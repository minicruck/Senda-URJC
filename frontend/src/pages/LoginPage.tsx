import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";

interface LocationState {
  from?: { pathname: string };
}

export default function LoginPage() {
  const { t } = useTranslation();
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (): Promise<void> => {
    setLoading(true);
    try {
      await login();
      const state = location.state as LocationState | null;
      const redirectTo = state?.from?.pathname ?? "/";
      navigate(redirectTo, { replace: true });
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

        <p className="mt-6 text-center text-xs text-gray-500">
          {t("login.mockNotice")}
        </p>
      </div>
    </section>
  );
}
