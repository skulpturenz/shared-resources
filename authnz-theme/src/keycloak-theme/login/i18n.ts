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
		verifyOAuth2DeviceUserCode: "Enter the code provided by your device",
		loginOtpDevice: "Device",
		doLogIn: "Sign in",
		pageExpiredMsg1: "Restart login",
		pageExpiredMsg2: "Continue login",
		errorTitle: "Error",
		loginTotpStep2: "Scan the barcode",
		loginTotpStep3DeviceName:
			"Name your device to help you manage your OTP devices",
		backToLogin: "Back to login",
		"recovery-code-config-warning-message":
			"Make sure to print, download, or copy them to a password manager and keep them safe. Canceling this setup will remove these recovery codes from your account.",
		recoveryCodesDownloaded: "Recovery codes downloaded",
		recoveryCodesCopied: "Recovery codes copied",
		recoveryCodesPrinted: "Recovery codes printed",
	},
});

export type I18n = typeof ofTypeI18n;
