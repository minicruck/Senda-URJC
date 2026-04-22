import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import MapView from "../components/MapView";

export default function HomePage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <section className="flex flex-1 flex-col">
      <div className="border-b border-gray-200 bg-white px-4 py-3">
        <h1 className="text-lg font-semibold text-gray-900">
          {t("home.welcome", { name: user?.displayName ?? "" })}
        </h1>
        <p className="text-sm text-gray-600">{t("app.tagline")}</p>
      </div>

      <div className="relative flex-1">
        <MapView />
        <Link
          to="/routes"
          className="absolute bottom-6 left-1/2 z-[1000] inline-flex min-h-tap -translate-x-1/2 items-center justify-center rounded-full bg-urjc-red px-6 py-3 text-base font-semibold text-white shadow-lg transition-colors hover:bg-urjc-red-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-urjc-red"
        >
          {t("home.cta")}
        </Link>
      </div>
    </section>
  );
}
