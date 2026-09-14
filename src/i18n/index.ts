import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "@/i18n/locales/en/common.json";
import enPrivacy from "@/i18n/locales/en/privacy.json";
import enTerms from "@/i18n/locales/en/terms.json";

export const resources = {
  en: {
    common: enCommon,
    privacy: enPrivacy,
    terms: enTerms,
  },
} as const;

export const supportedLanguages = ["en", "fr"] as const;
export type Language = (typeof supportedLanguages)[number];

export function createI18n(language: Language = "en") {
  const instance = i18n.createInstance();

  instance.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: "en",
    ns: ["common", "privacy", "terms"],

    defaultNS: "common",

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

  return instance;
}
