import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import az from "./az.json";
import en from "./en.json";
import ru from "./ru.json";

const savedLang = localStorage.getItem("amore_lang") || "az";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      az: { translation: az },
      en: { translation: en },
      ru: { translation: ru },
    },
    lng: savedLang,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on("languageChanged", (lng) => {
  localStorage.setItem("amore_lang", lng);
  document.documentElement.setAttribute("lang", lng);
});

export default i18n;