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

const UserProfileFormFields = lazy(() => import("./UserProfileFormFields"));

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
					default: {
						return (
							<DefaultPage
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
