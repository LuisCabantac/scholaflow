import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enAuth from "@/i18n/locales/en/auth.json";
import enTerms from "@/i18n/locales/en/terms.json";
import enCommon from "@/i18n/locales/en/common.json";
import enLayout from "@/i18n/locales/en/layout.json";
import enLanding from "@/i18n/locales/en/landing.json";
import enPrivacy from "@/i18n/locales/en/privacy.json";
import enClassroom from "@/i18n/locales/en/classroom.json";

export const defaultNS = "common" as const;

export const resources = {
  en: {
    auth: enAuth,
    classroom: enClassroom,
    common: enCommon,
    landing: enLanding,
    layout: enLayout,
    privacy: enPrivacy,
    terms: enTerms,
  },
} as const;

export const supportedLanguages = ["en"] as const;
export type Language = (typeof supportedLanguages)[number];

export function createI18n(language: Language = "en") {
  const instance = i18n.createInstance();

  instance.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: "en",
    ns: [
      "common",
      "auth",
      "classroom",
      "landing",
      "layout",
      "privacy",
      "terms",
    ],

    defaultNS,

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

  return instance;
}
