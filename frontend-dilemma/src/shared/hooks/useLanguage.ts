import { useTranslation } from "react-i18next";
import { RTL_LANGUAGES } from "@/shared/i18n";

export type Language = "en" | "he";

export function useLanguage() {
  const { i18n } = useTranslation();

  const currentLanguage = i18n.language as Language;
  const isRTL = RTL_LANGUAGES.includes(currentLanguage);

  const changeLanguage = (lang: Language) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const toggleLanguage = () => {
    const newLang = currentLanguage === "en" ? "he" : "en";
    changeLanguage(newLang);
  };

  return {
    currentLanguage,
    isRTL,
    changeLanguage,
    toggleLanguage,
  };
}
