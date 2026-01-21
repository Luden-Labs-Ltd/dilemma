import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en/translation.json";
import he from "./locales/he/translation.json";

export const RTL_LANGUAGES = ["he", "ar"];

const savedLanguage = localStorage.getItem("language") || "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    he: { translation: he },
  },
  lng: savedLanguage,
  fallbackLng: "en",
  supportedLngs: ["en", "he"],
  interpolation: {
    escapeValue: false,
  },
});

// Обновление RTL при смене языка
i18n.on("languageChanged", (lng) => {
  const dir = RTL_LANGUAGES.includes(lng) ? "rtl" : "ltr";
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
});

// Инициализация при загрузке
const initialLang = i18n.language || "en";
document.documentElement.dir = RTL_LANGUAGES.includes(initialLang)
  ? "rtl"
  : "ltr";
document.documentElement.lang = initialLang;

export default i18n;
