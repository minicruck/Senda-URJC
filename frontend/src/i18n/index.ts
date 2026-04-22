import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import es from "./locales/es.json";
import en from "./locales/en.json";

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
    },
    fallbackLng: "es",
    supportedLngs: ["es", "en"],
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "senda-lang",
    },
  });

// Keep <html lang="…"> in sync with the active language for a11y and SEO.
const syncHtmlLang = (lng: string): void => {
  if (typeof document !== "undefined") {
    document.documentElement.lang = lng.slice(0, 2);
  }
};
i18n.on("languageChanged", syncHtmlLang);
i18n.on("initialized", () => syncHtmlLang(i18n.resolvedLanguage ?? "es"));

export default i18n;
