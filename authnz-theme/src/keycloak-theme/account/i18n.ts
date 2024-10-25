import { i18nBuilder } from "keycloakify/account";
import type { ThemeName } from "../kc.gen";

export const { useI18n, ofTypeI18n } = i18nBuilder
	.withThemeName<ThemeName>()
	.withCustomTranslations({
		en: {
			lightTheme: "Light",
			darkTheme: "Dark",
			systemTheme: "System",
			switchTo: "Switch to",
			toggleTheme: "Toggle theme",
			selectLanguage: "Select language...",
			searchLanguage: "Search language...",
			noLanguages: "No language found",
			hidePassword: "Hide password",
			showPassword: "Show password",
			// Modified base
			backToApplication: "Back to application",
		},
	})
	.build();

export type I18n = typeof ofTypeI18n;
