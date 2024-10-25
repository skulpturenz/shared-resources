import { createUseI18n } from "keycloakify/account";

export const { useI18n, ofTypeI18n } = createUseI18n({
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
});

export type I18n = typeof ofTypeI18n;
