import { Suspense, lazy } from "react";
import type { ClassKey } from "keycloakify/login";
import type { KcContext } from "./KcContext";
import { useI18n } from "./i18n";
import DefaultPage from "keycloakify/login/DefaultPage";
import { Template } from "./Template";
import { Error } from "./pages/Error";
import { Info } from "./pages/Info";
import { Login } from "./pages/Login";
import { LoginIdpLinkConfirm } from "./pages/LoginIdpLinkConfirm";
import { LoginIdpLinkEmail } from "./pages/LoginIdpLinkEmail";
import { LoginOauthGrant } from "./pages/LoginOauthGrant";
import { LoginOtp } from "./pages/LoginOtp";
import { LoginOauth2DeviceVerifyUserCode } from "./pages/LoginOauth2DeviceVerifyUserCode";
import { LoginPageExpired } from "./pages/LoginPageExpired";
import { LoginConfigTotp } from "./pages/LoginConfigTotp";
import { LoginPassword } from "./pages/LoginPassword";
import { LoginRecoveryAuthnCodeInput } from "./pages/LoginRecoveryAuthnCodeInput";
import { LoginResetPassword } from "./pages/LoginResetPassword";
import { LoginUsername } from "./pages/LoginUsername";
import { LoginVerifyEmail } from "./pages/LoginVerifyEmail";
import { LoginRecoveryAuthnCodeConfig } from "./pages/LoginRecoveryAuthnCodeConfig";
import { Register } from "./pages/Register";
import { UpdateEmail } from "./pages/UpdateEmail";
import { IdpReviewUserProfile } from "./pages/IdpReviewUserProfile";

const UserProfileFormFields = lazy(() =>
	import("./UserProfileFormFields").then(({ UserProfileFormFields }) => ({
		default: UserProfileFormFields,
	})),
);

const doMakeUserConfirmPassword = true;

export default function KcPage(props: { kcContext: KcContext }) {
	const { kcContext } = props;

	const { i18n } = useI18n({ kcContext });

	return (
		<Suspense>
			{(() => {
				switch (kcContext.pageId) {
					case "error.ftl": {
						return (
							<Error
								kcContext={kcContext}
								i18n={i18n}
								classes={classes}
								Template={Template}
								doUseDefaultCss={false}
							/>
						);
					}
					case "info.ftl": {
						return (
							<Info
								kcContext={kcContext}
								i18n={i18n}
								classes={classes}
								Template={Template}
								doUseDefaultCss={false}
							/>
						);
					}
					case "login.ftl": {
						return (
							<Login
								kcContext={kcContext}
								i18n={i18n}
								classes={classes}
								Template={Template}
								doUseDefaultCss={false}
							/>
						);
					}
					case "login-idp-link-confirm.ftl": {
						return (
							<LoginIdpLinkConfirm
								kcContext={kcContext}
								i18n={i18n}
								classes={classes}
								Template={Template}
								doUseDefaultCss={false}
							/>
						);
					}
					case "login-idp-link-email.ftl": {
						return (
							<LoginIdpLinkEmail
								kcContext={kcContext}
								i18n={i18n}
								classes={classes}
								Template={Template}
								doUseDefaultCss={false}
							/>
						);
					}
					case "login-oauth2-device-verify-user-code.ftl": {
						return (
							<LoginOauth2DeviceVerifyUserCode
								kcContext={kcContext}
								i18n={i18n}
								classes={classes}
								Template={Template}
								doUseDefaultCss={false}
							/>
						);
					}
					case "login-oauth-grant.ftl": {
						return (
							<LoginOauthGrant
								kcContext={kcContext}
								i18n={i18n}
								classes={classes}
								Template={Template}
								doUseDefaultCss={false}
							/>
						);
					}
					case "login-otp.ftl": {
						return (
							<LoginOtp
								kcContext={kcContext}
								i18n={i18n}
								classes={classes}
								Template={Template}
								doUseDefaultCss={false}
							/>
						);
					}
					case "login-page-expired.ftl": {
						return (
							<LoginPageExpired
								kcContext={kcContext}
								i18n={i18n}
								classes={classes}
								Template={Template}
								doUseDefaultCss={false}
							/>
						);
					}
					case "login-config-totp.ftl": {
						return (
							<LoginConfigTotp
								kcContext={kcContext}
								i18n={i18n}
								classes={classes}
								Template={Template}
								doUseDefaultCss={false}
							/>
						);
					}
					case "login-password.ftl": {
						return (
							<LoginPassword
								kcContext={kcContext}
								i18n={i18n}
								classes={classes}
								Template={Template}
								doUseDefaultCss={false}
							/>
						);
					}
					case "login-recovery-authn-code-input.ftl": {
						return (
							<LoginRecoveryAuthnCodeInput
								kcContext={kcContext}
								i18n={i18n}
								classes={classes}
								Template={Template}
								doUseDefaultCss={false}
							/>
						);
					}
					case "login-reset-password.ftl": {
						return (
							<LoginResetPassword
								kcContext={kcContext}
								i18n={i18n}
								classes={classes}
								Template={Template}
								doUseDefaultCss={false}
							/>
						);
					}
					case "login-username.ftl": {
						return (
							<LoginUsername
								kcContext={kcContext}
								i18n={i18n}
								classes={classes}
								Template={Template}
								doUseDefaultCss={false}
							/>
						);
					}
					case "login-verify-email.ftl": {
						return (
							<LoginVerifyEmail
								kcContext={kcContext}
								i18n={i18n}
								classes={classes}
								Template={Template}
								doUseDefaultCss={false}
							/>
						);
					}
					case "login-recovery-authn-code-config.ftl": {
						return (
							<LoginRecoveryAuthnCodeConfig
								kcContext={kcContext}
								i18n={i18n}
								classes={classes}
								Template={Template}
								doUseDefaultCss={false}
							/>
						);
					}
					case "register.ftl": {
						return (
							<Register
								kcContext={kcContext}
								i18n={i18n}
								classes={classes}
								Template={Template}
								doUseDefaultCss={false}
								UserProfileFormFields={UserProfileFormFields}
								doMakeUserConfirmPassword={
									doMakeUserConfirmPassword
								}
							/>
						);
					}
					case "update-email.ftl": {
						return (
							<UpdateEmail
								kcContext={kcContext}
								i18n={i18n}
								classes={classes}
								Template={Template}
								doUseDefaultCss={false}
								UserProfileFormFields={UserProfileFormFields}
								doMakeUserConfirmPassword={
									doMakeUserConfirmPassword
								}
							/>
						);
					}
					case "idp-review-user-profile.ftl": {
						return (
							<IdpReviewUserProfile
								kcContext={kcContext}
								i18n={i18n}
								classes={classes}
								Template={Template}
								doUseDefaultCss={false}
								UserProfileFormFields={UserProfileFormFields}
								doMakeUserConfirmPassword={
									doMakeUserConfirmPassword
								}
							/>
						);
					}
					default: {
						return (
							<DefaultPage
								kcContext={kcContext}
								i18n={i18n}
								classes={classes}
								Template={Template}
								doUseDefaultCss={true}
								UserProfileFormFields={UserProfileFormFields}
								doMakeUserConfirmPassword={
									doMakeUserConfirmPassword
								}
							/>
						);
					}
				}
			})()}
		</Suspense>
	);
}

const classes = {
	kcBodyClass: "bg-background",
} satisfies {
	[key in ClassKey]?: string;
};
