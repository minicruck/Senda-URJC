import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function RouteRequestPage() {
  const { t } = useTranslation();

  return (
    <section className="flex flex-1 items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">
          {t("route.heading")}
        </h1>
        <p className="mt-2 text-gray-600">{t("route.placeholder")}</p>
        <Link
          to="/"
          className="mt-6 inline-flex min-h-tap items-center justify-center rounded border border-urjc-red px-4 py-2 text-sm font-semibold text-urjc-red transition-colors hover:bg-urjc-red hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-urjc-red"
        >
          {t("route.backHome")}
        </Link>
      </div>
    </section>
  );
}
