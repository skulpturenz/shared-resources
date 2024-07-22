import { createUseI18n } from "keycloakify/login";
import { en } from "./translations";

export const { useI18n, ofTypeI18n } = createUseI18n({
	en: {
		lightTheme: "Light",
		darkTheme: "Dark",
		systemTheme: "System",
		toggleTheme: "Toggle theme",
		selectLanguage: "Select language...",
		searchLanguage: "Search language...",
		noLanguages: "No language found",
		...en,
	},
});

export type I18n = typeof ofTypeI18n;
