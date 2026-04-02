// src/i18n/index.js
// i18next + react-i18next konfiqurasiyası
// Quraşdırma: npm install i18next react-i18next

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import az from "./az.json";
import en from "./en.json";
import ru from "./ru.json";

// LocalStorage-dan saxlanılmış dili al, yoxdursa default "az"
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
    fallbackLng: "en",        // translation tapılmazsa en-ə düş
    interpolation: {
      escapeValue: false,     // React özü XSS-dən qoruyur
    },
    // Yalnız statik UI mətnlər tərcümə olunur.
    // DB-dən gələn məhsul adı, qiymət, açıqlama — tərcümə edilmir.
  });

// Dil dəyişdikdə LocalStorage-a yaz
i18n.on("languageChanged", (lng) => {
  localStorage.setItem("amore_lang", lng);
  document.documentElement.setAttribute("lang", lng);
});

export default i18n;

// ── İstifadə nümunəsi ──────────────────────────────
// import { useTranslation } from "react-i18next";
// const { t } = useTranslation();
// <button>{t("common.add_to_cart")}</button>
//
// Dil dəyişdirmək üçün:
// import i18n from "@/i18n";
// i18n.changeLanguage("en");