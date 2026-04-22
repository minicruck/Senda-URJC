import { useTranslation } from "react-i18next";

const LANGS = ["es", "en"] as const;
type Lang = (typeof LANGS)[number];

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const current = (i18n.resolvedLanguage ?? "es").slice(0, 2) as Lang;

  const changeLanguage = (lang: Lang): void => {
    void i18n.changeLanguage(lang);
  };

  return (
    <div
      role="group"
      aria-label={t("language.switchTo")}
      className="flex overflow-hidden rounded border border-white/40"
    >
      {LANGS.map((lang) => {
        const selected = current === lang;
        return (
          <button
            key={lang}
            type="button"
            onClick={() => changeLanguage(lang)}
            aria-pressed={selected}
            className={`min-h-tap min-w-tap px-3 py-2 text-sm font-semibold uppercase transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              selected
                ? "bg-white text-urjc-red"
                : "text-white hover:bg-white/10"
            }`}
          >
            {lang}
          </button>
        );
      })}
    </div>
  );
}
