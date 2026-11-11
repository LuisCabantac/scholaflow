import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enAuth from "@/i18n/locales/en/auth.json";
import enChat from "@/i18n/locales/en/chat.json";
import enTodo from "@/i18n/locales/en/todo.json";
import enNotes from "@/i18n/locales/en/notes.json";
import enTerms from "@/i18n/locales/en/terms.json";
import enCommon from "@/i18n/locales/en/common.json";
import enLayout from "@/i18n/locales/en/layout.json";
import enPeople from "@/i18n/locales/en/people.json";
import enStream from "@/i18n/locales/en/stream.json";
import enLanding from "@/i18n/locales/en/landing.json";
import enPrivacy from "@/i18n/locales/en/privacy.json";
import enProfile from "@/i18n/locales/en/profile.json";
import enClassroom from "@/i18n/locales/en/classroom.json";
import enClasswork from "@/i18n/locales/en/classwork.json";
import enNotifications from "@/i18n/locales/en/notifications.json";
import enUserManagement from "@/i18n/locales/en/user-management.json";

export const defaultNS = "common" as const;

export const resources = {
  en: {
    auth: enAuth,
    chat: enChat,
    classroom: enClassroom,
    classwork: enClasswork,
    common: enCommon,
    landing: enLanding,
    layout: enLayout,
    people: enPeople,
    notes: enNotes,
    notifications: enNotifications,
    privacy: enPrivacy,
    profile: enProfile,
    stream: enStream,
    terms: enTerms,
    userManagement: enUserManagement,
    todo: enTodo,
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
      "chat",
      "classroom",
      "classwork",
      "landing",
      "layout",
      "people",
      "privacy",
      "profile",
      "stream",
      "terms",
      "userManagement",
      "notes",
      "notifications",
      "todo",
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
