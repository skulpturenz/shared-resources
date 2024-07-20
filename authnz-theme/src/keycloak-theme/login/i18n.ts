import { createUseI18n } from "keycloakify/login";

export const { useI18n, ofTypeI18n } = createUseI18n({
	en: {
		lightTheme: "Light",
		darkTheme: "Dark",
		systemTheme: "System",
		toggleTheme: "Toggle theme",
		selectLanguage: "Select language...",
		searchLanguage: "Search language...",
		noLanguages: "No language found",
		backToApplication: "Back to application",
		proceedWithAction: "Click here to proceed",
		emailLinkIdp4: "Already verified?",
		oauthGrantReview: "Review the",
	},
});

export type I18n = typeof ofTypeI18n;
