import { useState } from "react";
import { clsx } from "keycloakify/tools/clsx";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Button } from "@/components/ui/button";
import { H4, Small } from "@/components/typography";
import { useTheme } from "@/components/ui/theme-provider";
import {
	LogoGoogle,
	LogoMicrosoft,
	LogoFacebook,
	LogoInstagram,
	LogoTwitter,
	LogoLinkedin,
	LogoStackoverflow,
	LogoGithub,
	LogoGitlab,
	LogoBitbucket,
	LogoPaypal,
	LogoOpenshift,
} from "@/components/assets";
import { Form, FormGroup } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const SSO_PROVIDERS_ICONS = {
	google: LogoGoogle,
	microsoft: LogoMicrosoft,
	facebook: LogoFacebook,
	instagram: LogoInstagram,
	twitter: LogoTwitter,
	linkedin: LogoLinkedin,
	stackoverflow: LogoStackoverflow,
	github: LogoGithub,
	gitlab: LogoGitlab,
	bitbucket: LogoBitbucket,
	paypal: LogoPaypal,
	openshift: LogoOpenshift,
};

export const LoginUsername = (
	props: PageProps<
		Extract<KcContext, { pageId: "login-username.ftl" }>,
		I18n
	>,
) => {
	const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

	const { kcClsx } = getKcClsx({
		doUseDefaultCss,
		classes,
	});

	const {
		social,
		realm,
		url,
		usernameHidden,
		login,
		registrationDisabled,
		messagesPerField,
	} = kcContext;

	const { msg, msgStr } = i18n;

	const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);
	const { theme } = useTheme();

	const onSubmit = () => {
		setIsLoginButtonDisabled(true);
		return true;
	};

	return (
		<Template
			kcContext={kcContext}
			i18n={i18n}
			doUseDefaultCss={doUseDefaultCss}
			classes={classes}
			displayMessage={!messagesPerField.existsError("username")}
			displayInfo={
				realm.password &&
				realm.registrationAllowed &&
				!registrationDisabled
			}
			infoNode={
				<Button className="w-full" variant="ghost" asChild>
					<a tabIndex={8} href={url.registrationUrl}>
						{msg("noAccount")}&nbsp;{msg("doRegister")}
					</a>
				</Button>
			}
			headerNode={msg("doLogIn")}
			socialProvidersNode={
				<>
					{realm.password && social.providers?.length && (
						<>
							<div className="flex flex-col items-center gap-4 w-full">
								<H4>{msg("identity-provider-login-label")}</H4>
								<div
									className={
										social.providers.length < 3
											? "flex gap-4"
											: "grid grid-flow-row md:grid-cols-3 w-full gap-4"
									}>
									{social.providers.map(provider => {
										const Logo =
											SSO_PROVIDERS_ICONS[
												provider.providerId as keyof typeof SSO_PROVIDERS_ICONS
											] ?? "span";

										return (
											<Button
												key={provider.providerId}
												asChild
												variant={
													theme === "light"
														? "default"
														: "outline"
												}
												className="px-5 py-6 w-full">
												<a
													className="flex gap-2 items-center"
													href={provider.loginUrl}>
													{provider.iconClasses && (
														<i
															className={clsx(
																kcClsx(
																	"kcCommonLogoIdP",
																),
																provider.iconClasses,
															)}
															aria-hidden="true"></i>
													)}
													<Logo className="w-5 h-auto text-foreground" />

													{provider.displayName}
												</a>
											</Button>
										);
									})}
								</div>
							</div>
						</>
					)}
				</>
			}>
			{realm.password && (
				<Form
					onSubmit={onSubmit}
					action={url.loginAction}
					method="POST">
					{!usernameHidden && (
						<FormGroup>
							<Label htmlFor="username">
								{!realm.loginWithEmailAllowed &&
									msg("username")}
								{realm.loginWithEmailAllowed &&
									!realm.registrationEmailAsUsername &&
									msg("usernameOrEmail")}
								{realm.loginWithEmailAllowed &&
									realm.registrationEmailAsUsername &&
									msg("email")}
							</Label>
							<Input
								tabIndex={2}
								id="username"
								name="username"
								type="text"
								autoFocus
								autoComplete="username"
								isError={messagesPerField.existsError(
									"username",
								)}
							/>
							{messagesPerField.existsError("username") && (
								<Small aria-live="polite">
									{messagesPerField.getFirstError("username")}
								</Small>
							)}
						</FormGroup>
					)}

					{realm.rememberMe && !usernameHidden && (
						<FormGroup flexDirection="row">
							<Checkbox
								tabIndex={3}
								id="rememberMe"
								name="rememberMe"
								defaultChecked={Boolean(login.rememberMe)}
							/>
							<Label htmlFor="rememberMe">
								{msg("rememberMe")}
							</Label>
						</FormGroup>
					)}

					<FormGroup>
						<Button asChild>
							<input
								tabIndex={4}
								disabled={isLoginButtonDisabled}
								name="login"
								type="submit"
								value={msgStr("doLogIn")}
							/>
						</Button>
					</FormGroup>
				</Form>
			)}
		</Template>
	);
};
