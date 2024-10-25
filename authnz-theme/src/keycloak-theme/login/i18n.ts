import { i18nBuilder } from "keycloakify/account";
import type { ThemeName } from "../kc.gen";

// Must be able to statically evaluate
export const { useI18n, ofTypeI18n } = i18nBuilder
	.withThemeName<ThemeName>()
	.withCustomTranslations({
		en: {
			// Custom
			lightTheme: "Light",
			darkTheme: "Dark",
			systemTheme: "System",
			toggleTheme: "Toggle theme",
			selectLanguage: "Select language...",
			searchLanguage: "Search language...",
			noLanguages: "No language found",
			// Modified base
			backToApplication: "Back to application",
			proceedWithAction: "Click here to proceed",
			emailLinkIdp4: "Already verified?",
			oauthGrantReview: "Review the",
			verifyOAuth2DeviceUserCode:
				"Enter the code provided by your device",
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
			doForgotPassword: "Forgot password?",
			emailForgotTitle: "Forgot password?",
			loginTotpStep3:
				"Enter the one-time code provided by the application",
			// Default (title cased as appropriate)
			doRegister: "Register",
			doRegisterSecurityKey: "Register",
			doCancel: "Cancel",
			doSubmit: "Submit",
			doBack: "Back",
			doYes: "Yes",
			doNo: "No",
			doContinue: "Continue",
			doIgnore: "Ignore",
			doAccept: "Accept",
			doDecline: "Decline",
			doClickHere: "Click here",
			doImpersonate: "Impersonate",
			doTryAgain: "Try again",
			doTryAnotherWay: "Try another way",
			doConfirmDelete: "Confirm deletion",
			errorDeletingAccount: "Error happened while deleting account",
			deletingAccountForbidden:
				"You do not have enough permissions to delete your own account, contact admin.",
			kerberosNotConfigured: "Kerberos not configured",
			kerberosNotConfiguredTitle: "Kerberos not configured",
			bypassKerberosDetail:
				"Either you are not logged in by Kerberos or your browser is not set up for Kerberos login.  Please click continue to login in through other means",
			kerberosNotSetUp: "Kerberos is not set up.  You cannot login.",
			registerTitle: "Register",
			loginAccountTitle: "Sign in to your account",
			loginTitle: "Sign in to {0}",
			loginTitleHtml: "{0}",
			impersonateTitle: "{0} Impersonate user",
			impersonateTitleHtml: "<strong>{0}</strong> Impersonate user",
			realmChoice: "Realm",
			unknownUser: "Unknown user",
			loginTotpTitle: "Mobile authenticator setup",
			loginProfileTitle: "Update account information",
			loginIdpReviewProfileTitle: "Update account information",
			loginTimeout:
				"Your login attempt timed out.  Login will start from the beginning.",
			reauthenticate: "Please re-authenticate to continue",
			authenticateStrong: "Strong authentication required to continue",
			oauthGrantTitle: "Grant access to {0}",
			oauthGrantTitleHtml: "{0}",
			oauthGrantInformation:
				"Make sure you trust {0} by learning how {0} will handle your data.",
			oauthGrantTos: "terms of service.",
			oauthGrantPolicy: "privacy policy.",
			errorTitleHtml: "Error",
			emailVerifyTitle: "Email verification",
			updateEmailTitle: "Update email",
			emailUpdateConfirmationSentTitle: "Confirmation email sent",
			emailUpdateConfirmationSent:
				"A confirmation email has been sent to {0}. You must follow the instructions of the former to complete the email update.",
			emailUpdatedTitle: "Email updated",
			emailUpdated:
				"The account email has been successfully updated to {0}.",
			updatePasswordTitle: "Update password",
			codeSuccessTitle: "Success code",
			codeErrorTitle: "Error code: {0}",
			displayUnsupported: "Requested display type unsupported",
			browserRequired: "Browser required to login",
			browserContinue: "Browser required to complete login",
			browserContinuePrompt: "Open browser and continue login? [y/n]:",
			browserContinueAnswer: "y",
			usb: "USB",
			nfc: "NFC",
			bluetooth: "Bluetooth",
			internal: "Internal",
			unknown: "Unknown",
			termsTitle: "Terms and conditions",
			termsText: "",
			termsPlainText: "Terms and conditions to be defined.",
			termsAcceptanceRequired:
				"You must agree to our terms and conditions.",
			acceptTerms: "I agree to the terms and conditions",
			deleteCredentialTitle: "Delete {0}",
			deleteCredentialMessage: "Do you want to delete {0}?",
			recaptchaFailed: "Invalid Recaptcha",
			recaptchaNotConfigured: "Recaptcha is required, but not configured",
			consentDenied: "Consent denied.",
			noAccount: "New user?",
			username: "Username",
			usernameOrEmail: "Username or email",
			firstName: "First name",
			givenName: "Given name",
			fullName: "Full name",
			lastName: "Last name",
			familyName: "Family name",
			email: "Email",
			password: "Password",
			passwordConfirm: "Confirm password",
			passwordNew: "New password",
			passwordNewConfirm: "New password confirmation",
			hidePassword: "Hide password",
			showPassword: "Show password",
			rememberMe: "Remember me",
			authenticatorCode: "One-time code",
			address: "Address",
			street: "Street",
			locality: "City or locality",
			region: "State, province, or region",
			postal_code: "Zip or postal code",
			country: "Country",
			emailVerified: "Email verified",
			website: "Web page",
			phoneNumber: "Phone number",
			phoneNumberVerified: "Phone number verified",
			gender: "Gender",
			birthday: "Birthdate",
			zoneinfo: "Time zone",
			gssDelegationCredential: "GSS Delegation Credential",
			logoutOtherSessions: "Sign out from other devices",
			profileScopeConsentText: "User profile",
			emailScopeConsentText: "Email address",
			addressScopeConsentText: "Address",
			phoneScopeConsentText: "Phone number",
			offlineAccessScopeConsentText: "Offline access",
			samlRoleListScopeConsentText: "My roles",
			rolesScopeConsentText: "User roles",
			restartLoginTooltip: "Restart login",
			loginTotpIntro:
				"You need to set up a One Time Password generator to access this account",
			loginTotpStep1:
				"Install one of the following applications on your mobile:",
			loginTotpManualStep2: "Open the application and enter the key:",
			loginTotpManualStep3:
				"Use the following configuration values if the application allows setting them:",
			loginTotpUnableToScan: "Unable to scan?",
			loginTotpScanBarcode: "Scan barcode?",
			loginCredential: "Credential",
			loginOtpOneTime: "One-time code",
			loginTotpType: "Type",
			loginTotpAlgorithm: "Algorithm",
			loginTotpDigits: "Digits",
			loginTotpInterval: "Interval",
			loginTotpCounter: "Counter",
			loginTotpDeviceName: "Device Name",
			"loginTotp.totp": "Time-based",
			"loginTotp.hotp": "Counter-based",
			totpAppFreeOTPName: "FreeOTP",
			totpAppGoogleName: "Google Authenticator",
			totpAppMicrosoftAuthenticatorName: "Microsoft Authenticator",
			loginChooseAuthenticator: "Select login method",
			oauthGrantRequest: "Do you grant these access privileges?",
			inResource: "in",
			oauth2DeviceVerificationTitle: "Device Login",
			oauth2DeviceInvalidUserCodeMessage:
				"Invalid code, please try again.",
			oauth2DeviceExpiredUserCodeMessage:
				"The code has expired. Please go back to your device and try connecting again.",
			oauth2DeviceVerificationCompleteHeader: "Device login successful",
			oauth2DeviceVerificationCompleteMessage:
				"You may close this browser window and go back to your device.",
			oauth2DeviceVerificationFailedHeader: "Device login failed",
			oauth2DeviceVerificationFailedMessage:
				"You may close this browser window and go back to your device and try connecting again.",
			oauth2DeviceConsentDeniedMessage:
				"Consent denied for connecting the device.",
			oauth2DeviceAuthorizationGrantDisabledMessage:
				"Client is not allowed to initiate OAuth 2.0 Device Authorization Grant. The flow is disabled for the client.",
			emailVerifyInstruction1:
				"An email with instructions to verify your email address has been sent to your address {0}.",
			emailVerifyInstruction2:
				"Haven't received a verification code in your email?",
			emailVerifyInstruction3: "to re-send the email.",
			emailLinkIdpTitle: "Link {0}",
			emailLinkIdp1:
				"An email with instructions to link {0} account {1} with your {2} account has been sent to you.",
			emailLinkIdp2:
				"Haven't received a verification code in your email?",
			emailLinkIdp3: "to re-send the email.",
			emailLinkIdp5: "to continue.",
			emailInstruction:
				"Enter your username or email address and we will send you instructions on how to create a new password.",
			emailInstructionUsername:
				"Enter your username and we will send you instructions on how to create a new password.",
			copyCodeInstruction:
				"Please copy this code and paste it into your application:",
			pageExpiredTitle: "Page has expired",
			personalInfo: "Personal info:",
			role_admin: "Admin",
			"role_realm-admin": "Realm admin",
			"role_create-realm": "Create realm",
			"role_create-client": "Create client",
			"role_view-realm": "View realm",
			"role_view-users": "View users",
			"role_view-applications": "View applications",
			"role_view-clients": "View clients",
			"role_view-events": "View events",
			"role_view-identity-providers": "View identity providers",
			"role_manage-realm": "Manage realm",
			"role_manage-users": "Manage users",
			"role_manage-applications": "Manage applications",
			"role_manage-identity-providers": "Manage identity providers",
			"role_manage-clients": "Manage clients",
			"role_manage-events": "Manage events",
			"role_view-profile": "View profile",
			"role_manage-account": "Manage account",
			"role_manage-account-links": "Manage account links",
			"role_read-token": "Read token",
			"role_offline-access": "Offline access",
			client_account: "Account",
			"client_account-console": "Account console",
			"client_security-admin-console": "Security admin console",
			"client_admin-cli": "Admin CLI",
			"client_realm-management": "Realm management",
			client_broker: "Broker",
			requiredFields: "Required fields",
			invalidUserMessage: "Invalid username or password.",
			invalidUsernameMessage: "Invalid username.",
			invalidUsernameOrEmailMessage: "Invalid username or email.",
			invalidPasswordMessage: "Invalid password.",
			invalidEmailMessage: "Invalid email address.",
			accountDisabledMessage:
				"Account is disabled, contact your administrator.",
			accountTemporarilyDisabledMessage:
				"Account is temporarily disabled; contact your administrator or retry later.",
			expiredCodeMessage: "Login timeout. Please sign in again.",
			expiredActionMessage:
				"Action expired. Please continue with login now.",
			expiredActionTokenNoSessionMessage: "Action expired.",
			expiredActionTokenSessionExistsMessage:
				"Action expired. Please start again.",
			sessionLimitExceeded: "There are too many sessions",
			missingFirstNameMessage: "Please specify first name.",
			missingLastNameMessage: "Please specify last name.",
			missingEmailMessage: "Please specify email.",
			missingUsernameMessage: "Please specify username.",
			missingPasswordMessage: "Please specify password.",
			missingTotpMessage: "Please specify authenticator code.",
			missingTotpDeviceNameMessage: "Please specify device name.",
			notMatchPasswordMessage: "Passwords don't match.",
			"error-invalid-value": "Invalid value.",
			"error-invalid-blank": "Please specify value.",
			"error-empty": "Please specify value.",
			"error-invalid-length": "Length must be between {1} and {2}.",
			"error-invalid-length-too-short": "Minimal length is {1}.",
			"error-invalid-length-too-long": "Maximal length is {2}.",
			"error-invalid-email": "Invalid email address.",
			"error-invalid-number": "Invalid number.",
			"error-number-out-of-range": "Number must be between {1} and {2}.",
			"error-number-out-of-range-too-small":
				"Number must have minimal value of {1}.",
			"error-number-out-of-range-too-big":
				"Number must have maximal value of {2}.",
			"error-pattern-no-match": "Invalid value.",
			"error-invalid-uri": "Invalid URL.",
			"error-invalid-uri-scheme": "Invalid URL scheme.",
			"error-invalid-uri-fragment": "Invalid URL fragment.",
			"error-user-attribute-required": "Please specify this field.",
			"error-invalid-date": "Invalid date.",
			"error-user-attribute-read-only": "This field is read only.",
			"error-username-invalid-character":
				"Value contains invalid character.",
			"error-person-name-invalid-character":
				"Value contains invalid character.",
			"error-reset-otp-missing-id": "Please choose an OTP configuration.",
			invalidPasswordExistingMessage: "Invalid existing password.",
			invalidPasswordBlacklistedMessage:
				"Invalid password: password is blacklisted.",
			invalidPasswordConfirmMessage:
				"Password confirmation doesn't match.",
			invalidTotpMessage: "Invalid authenticator code.",
			usernameExistsMessage: "Username already exists.",
			emailExistsMessage: "Email already exists.",
			federatedIdentityExistsMessage:
				"User with {0} {1} already exists. Please login to account management to link the account.",
			federatedIdentityUnavailableMessage:
				"User {0} authenticated with identity provider {1} does not exist. Please contact your administrator.",
			federatedIdentityUnmatchedEssentialClaimMessage:
				"The ID token issued by the identity provider does not match the configured essential claim. Please contact your administrator.",
			confirmLinkIdpTitle: "Account already exists",
			federatedIdentityConfirmLinkMessage:
				"User with {0} {1} already exists. How do you want to continue?",
			federatedIdentityConfirmReauthenticateMessage:
				"Authenticate to link your account with {0}",
			nestedFirstBrokerFlowMessage:
				"The {0} user {1} is not linked to any known user.",
			confirmLinkIdpReviewProfile: "Review profile",
			confirmLinkIdpContinue: "Add to existing account",
			configureTotpMessage:
				"You need to set up Mobile Authenticator to activate your account.",
			configureBackupCodesMessage:
				"You need to set up Backup Codes to activate your account.",
			updateProfileMessage:
				"You need to update your user profile to activate your account.",
			updatePasswordMessage:
				"You need to change your password to activate your account.",
			updateEmailMessage:
				"You need to update your email address to activate your account.",
			resetPasswordMessage: "You need to change your password.",
			verifyEmailMessage:
				"You need to verify your email address to activate your account.",
			linkIdpMessage:
				"You need to verify your email address to link your account with {0}.",
			emailSentMessage:
				"You should receive an email shortly with further instructions.",
			emailSendErrorMessage:
				"Failed to send email, please try again later.",
			accountUpdatedMessage: "Your account has been updated.",
			accountPasswordUpdatedMessage: "Your password has been updated.",
			delegationCompleteHeader: "Login successful",
			delegationCompleteMessage:
				"You may close this browser window and go back to your console application.",
			delegationFailedHeader: "Login failed",
			delegationFailedMessage:
				"You may close this browser window and go back to your console application and try logging in again.",
			noAccessMessage: "No access",
			invalidPasswordMinLengthMessage:
				"Invalid password: minimum length {0}.",
			invalidPasswordMaxLengthMessage:
				"Invalid password: maximum length {0}.",
			invalidPasswordMinDigitsMessage:
				"Invalid password: must contain at least {0} numerical digits.",
			invalidPasswordMinLowerCaseCharsMessage:
				"Invalid password: must contain at least {0} lower case characters.",
			invalidPasswordMinUpperCaseCharsMessage:
				"Invalid password: must contain at least {0} upper case characters.",
			invalidPasswordMinSpecialCharsMessage:
				"Invalid password: must contain at least {0} special characters.",
			invalidPasswordNotUsernameMessage:
				"Invalid password: must not be equal to the username.",
			invalidPasswordNotEmailMessage:
				"Invalid password: must not be equal to the email.",
			invalidPasswordRegexPatternMessage:
				"Invalid password: fails to match regex pattern(s).",
			invalidPasswordHistoryMessage:
				"Invalid password: must not be equal to any of last {0} passwords.",
			invalidPasswordGenericMessage:
				"Invalid password: new password doesn't match password policies.",
			failedToProcessResponseMessage: "Failed to process response",
			httpsRequiredMessage: "HTTPS required",
			realmNotEnabledMessage: "Realm not enabled",
			invalidRequestMessage: "Invalid request",
			successLogout: "You are logged out",
			failedLogout: "Logout failed",
			unknownLoginRequesterMessage: "Unknown login requester",
			loginRequesterNotEnabledMessage: "Login requester not enabled",
			bearerOnlyMessage:
				"Bearer-only applications are not allowed to initiate browser login",
			standardFlowDisabledMessage:
				"Client is not allowed to initiate browser login with given response_type. Standard flow is disabled for the client.",
			implicitFlowDisabledMessage:
				"Client is not allowed to initiate browser login with given response_type. Implicit flow is disabled for the client.",
			invalidRedirectUriMessage: "Invalid redirect uri",
			unsupportedNameIdFormatMessage: "Unsupported NameIDFormat",
			invalidRequesterMessage: "Invalid requester",
			registrationNotAllowedMessage: "Registration not allowed",
			resetCredentialNotAllowedMessage: "Reset credential not allowed",
			permissionNotApprovedMessage: "Permission not approved.",
			noRelayStateInResponseMessage:
				"No relay state in response from identity provider.",
			insufficientPermissionMessage:
				"Insufficient permissions to link identities.",
			couldNotProceedWithAuthenticationRequestMessage:
				"Could not proceed with authentication request to identity provider.",
			couldNotObtainTokenMessage:
				"Could not obtain token from identity provider.",
			unexpectedErrorRetrievingTokenMessage:
				"Unexpected error when retrieving token from identity provider.",
			unexpectedErrorHandlingResponseMessage:
				"Unexpected error when handling response from identity provider.",
			identityProviderAuthenticationFailedMessage:
				"Authentication failed. Could not authenticate with identity provider.",
			couldNotSendAuthenticationRequestMessage:
				"Could not send authentication request to identity provider.",
			unexpectedErrorHandlingRequestMessage:
				"Unexpected error when handling authentication request to identity provider.",
			invalidAccessCodeMessage: "Invalid access code.",
			sessionNotActiveMessage: "Session not active.",
			invalidCodeMessage:
				"An error occurred, please login again through your application.",
			cookieNotFoundMessage:
				"Cookie not found. Please make sure cookies are enabled in your browser.",
			insufficientLevelOfAuthentication:
				"The requested level of authentication has not been satisfied.",
			identityProviderUnexpectedErrorMessage:
				"Unexpected error when authenticating with identity provider",
			identityProviderMissingStateMessage:
				"Missing state parameter in response from identity provider.",
			identityProviderMissingCodeOrErrorMessage:
				"Missing code or error parameter in response from identity provider.",
			identityProviderInvalidResponseMessage:
				"Invalid response from identity provider.",
			identityProviderInvalidSignatureMessage:
				"Invalid signature in response from identity provider.",
			identityProviderNotFoundMessage:
				"Could not find an identity provider with the identifier.",
			identityProviderLinkSuccess:
				"You successfully verified your email. Please go back to your original browser and continue there with the login.",
			staleCodeMessage:
				"This page is no longer valid, please go back to your application and sign in again",
			realmSupportsNoCredentialsMessage:
				"Realm does not support any credential type.",
			credentialSetupRequired: "Cannot login, credential setup required.",
			identityProviderNotUniqueMessage:
				"Realm supports multiple identity providers. Could not determine which identity provider should be used to authenticate with.",
			emailVerifiedMessage: "Your email address has been verified.",
			emailVerifiedAlreadyMessage:
				"Your email address has been verified already.",
			staleEmailVerificationLink:
				"The link you clicked is an old stale link and is no longer valid.  Maybe you have already verified your email.",
			identityProviderAlreadyLinkedMessage:
				"Federated identity returned by {0} is already linked to another user.",
			confirmAccountLinking:
				"Confirm linking the account {0} of identity provider {1} with your account.",
			confirmEmailAddressVerification:
				"Confirm validity of e-mail address {0}.",
			confirmExecutionOfActions: "Perform the following action(s)",
			locale_ar: "عربي",
			locale_ca: "Català",
			locale_cs: "Čeština",
			locale_da: "Dansk",
			locale_de: "Deutsch",
			locale_en: "English",
			locale_es: "Español",
			locale_fi: "Suomi",
			locale_fr: "Français",
			locale_hu: "Magyar",
			locale_it: "Italiano",
			locale_ja: "日本語",
			locale_lt: "Lietuvių",
			locale_lv: "Latviešu",
			locale_nl: "Nederlands",
			locale_no: "Norsk",
			locale_pl: "Polski",
			"locale_pt-BR": "Português (Brasil)",
			locale_ru: "Русский",
			locale_sk: "Slovenčina",
			locale_sv: "Svenska",
			locale_th: "ไทย",
			locale_tr: "Türkçe",
			locale_uk: "Українська",
			"locale_zh-CN": "中文简体",
			missingParameterMessage: "Missing parameters: {0}",
			clientNotFoundMessage: "Client not found.",
			clientDisabledMessage: "Client disabled.",
			invalidParameterMessage: "Invalid parameter: {0}",
			alreadyLoggedIn: "You are already logged in.",
			differentUserAuthenticated:
				"You are already authenticated as different user '{0}' in this session. Please sign out first.",
			brokerLinkingSessionExpired:
				"Requested broker account linking, but current session is no longer valid.",
			acrNotFulfilled: "Authentication requirements not fulfilled",
			"requiredAction.CONFIGURE_TOTP": "Configure OTP",
			"requiredAction.TERMS_AND_CONDITIONS": "Terms and conditions",
			"requiredAction.UPDATE_PASSWORD": "Update password",
			"requiredAction.UPDATE_PROFILE": "Update profile",
			"requiredAction.VERIFY_EMAIL": "Verify email",
			"requiredAction.CONFIGURE_RECOVERY_AUTHN_CODES":
				"Generate recovery codes",
			"requiredAction.webauthn-register-passwordless":
				"Webauthn register passwordless",
			invalidTokenRequiredActions:
				"Required actions included in the link are not valid",
			doX509Login: "You will be logged in as:",
			clientCertificate: "X509 client certificate:",
			noCertificate: "[No Certificate]",
			pageNotFound: "Page not found",
			internalServerError: "An internal server error has occurred",
			"console-username": "Username:",
			"console-password": "Password:",
			"console-otp": "One Time Password:",
			"console-new-password": "New password:",
			"console-confirm-password": "Confirm password:",
			"console-update-password": "Update of your password is required.",
			"console-verify-email":
				"You need to verify your email address.  We sent an email to {0} that contains a verification code.  Please enter this code into the input below.",
			"console-email-code": "Email code:",
			"console-accept-terms": "Accept terms? [y/n]:",
			"console-accept": "y",
			"openshift.scope.user_info": "User information",
			"openshift.scope.user_check-access": "User access information",
			"openshift.scope.user_full": "Full access",
			"openshift.scope.list-projects": "List projects",
			"saml.post-form.title": "Authentication redirect",
			"saml.post-form.message": "Redirecting, please wait.",
			"saml.post-form.js-disabled":
				"JavaScript is disabled. We strongly recommend to enable it. Click the button below to continue. ",
			"saml.artifactResolutionServiceInvalidResponse":
				"Unable to resolve artifact.",
			"otp-display-name": "Authenticator application",
			"otp-help-text":
				"Enter a verification code from authenticator application.",
			"otp-reset-description":
				"Which OTP configuration should be removed?",
			"password-display-name": "Password",
			"password-help-text": "Sign in by entering your password.",
			"auth-username-form-display-name": "Username",
			"auth-username-form-help-text":
				"Start sign in by entering your username",
			"auth-username-password-form-display-name": "Username and password",
			"auth-username-password-form-help-text":
				"Sign in by entering your username and password.",
			"auth-recovery-authn-code-form-display-name":
				"Recovery authentication code",
			"auth-recovery-authn-code-form-help-text":
				"Enter a recovery authentication code from a previously generated list.",
			"auth-recovery-code-info-message":
				"Enter the specified recovery code.",
			"auth-recovery-code-prompt": "Recovery code #{0}",
			"auth-recovery-code-header":
				"Login with a recovery authentication code",
			"recovery-codes-error-invalid":
				"Invalid recovery authentication code",
			"recovery-code-config-header": "Recovery authentication codes",
			"recovery-code-config-warning-title":
				"These recovery codes won't appear again after leaving this page",
			"recovery-codes-print": "Print",
			"recovery-codes-download": "Download",
			"recovery-codes-copy": "Copy",
			"recovery-codes-copied": "Copied",
			"recovery-codes-confirmation-message":
				"I have saved these codes somewhere safe",
			"recovery-codes-action-complete": "Complete setup",
			"recovery-codes-action-cancel": "Cancel setup",
			"recovery-codes-download-file-header":
				"Keep these recovery codes somewhere safe.",
			"recovery-codes-download-file-description":
				"Recovery codes are single-use passcodes that allow you to sign in to your account if you do not have access to your authenticator.",
			"recovery-codes-download-file-date":
				"These codes were generated on",
			"recovery-codes-label-default": "Recovery codes",
			"webauthn-display-name": "Passkey",
			"webauthn-help-text": "Use your Passkey to sign in.",
			"webauthn-passwordless-display-name": "Passkey",
			"webauthn-passwordless-help-text":
				"Use your Passkey for passwordless sign in.",
			"webauthn-login-title": "Passkey login",
			"webauthn-registration-title": "Passkey registration",
			"webauthn-available-authenticators": "Available passkeys",
			"webauthn-unsupported-browser-text":
				"WebAuthn is not supported by this browser. Try another one or contact your administrator.",
			"webauthn-doAuthenticate": "Sign in with Passkey",
			"webauthn-createdAt-label": "Created",
			"webauthn-error-title": "Passkey error",
			"webauthn-error-registration":
				"Failed to register your Passkey.<br/> {0}",
			"webauthn-error-api-get":
				"Failed to authenticate by the Passkey.<br/> {0}",
			"webauthn-error-different-user":
				"First authenticated user is not the one authenticated by the Passkey.",
			"webauthn-error-auth-verification":
				"Passkey authentication result is invalid.<br/> {0}",
			"webauthn-error-register-verification":
				"Passkey registration result is invalid.<br/> {0}",
			"webauthn-error-user-not-found":
				"Unknown user authenticated by the Passkey.",
			"identity-provider-redirector":
				"Connect with another identity provider",
			"identity-provider-login-label": "Or sign in with",
			"idp-email-verification-display-name": "Email verification",
			"idp-email-verification-help-text":
				"Link your account by validating your email.",
			"idp-username-password-form-display-name": "Username and password",
			"idp-username-password-form-help-text":
				"Link your account by logging in.",
			finalDeletionConfirmation:
				"If you delete your account, it cannot be restored. To keep your account, click cancel.",
			irreversibleAction: "This action is irreversible",
			deleteAccountConfirm: "Delete account confirmation",
			deletingImplies: "Deleting your account implies:",
			errasingData: "Erasing all your data",
			loggingOutImmediately: "Logging you out immediately",
			accountUnusable:
				"Any subsequent use of the application will not be possible with this account",
			userDeletedSuccessfully: "User deleted successfully",
			"access-denied": "Access denied",
			"access-denied-when-idp-auth":
				"Access denied when authenticating with {0}",
			"frontchannel-logout.title": "Logging out",
			"frontchannel-logout.message":
				"You are logging out from following apps",
			logoutConfirmTitle: "Logging out",
			logoutConfirmHeader: "Do you want to log out?",
			doLogout: "Logout",
			readOnlyUsernameMessage:
				"You can't update your username as it is read-only.",
			"error-invalid-multivalued-size":
				"Attribute {0} must have at least {1} and at most {2} value(s).",
			shouldBeEqual: "{0} should be equal to {1}",
			shouldBeDifferent: "{0} should be different to {1}",
			shouldMatchPattern: "Pattern should match: `/{0}/`",
			mustBeAnInteger: "Must be an integer",
			notAValidOption: "Not a valid option",
			selectAnOption: "Select an option",
			remove: "Remove",
			addValue: "Add value",
			languages: "Languages",
		},
	})
	.build();

export type I18n = typeof ofTypeI18n;
