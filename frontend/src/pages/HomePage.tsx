import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import MapView from "../components/MapView";

export default function HomePage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <section className="flex flex-1 flex-col">
      <div className="border-b border-gray-200 bg-white px-4 py-4">
        <h1 className="text-lg font-semibold text-gray-900">
          {t("home.welcome", { name: user?.displayName ?? "" })}
        </h1>
        <p className="mt-1 text-sm text-gray-600">{t("app.tagline")}</p>

        <Link
          to="/routes"
          className="mt-4 inline-flex min-h-tap items-center justify-center rounded-lg bg-urjc-red px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-urjc-red-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-urjc-red"
        >
          {t("home.cta")}
        </Link>
      </div>

      <div className="relative flex-1">
        <MapView />
      </div>
    </section>
  );
}
