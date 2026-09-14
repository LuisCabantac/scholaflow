import { type ReactNode, useMemo } from "react";
import { I18nextProvider } from "react-i18next";

import { createI18n, type Language } from "@/i18n";

type I18nProviderProps = {
	language?: Language;
	children: ReactNode;
};

export function I18nProvider({ language = "en", children }: I18nProviderProps) {
	const i18n = useMemo(() => createI18n(language), [language]);

	return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
