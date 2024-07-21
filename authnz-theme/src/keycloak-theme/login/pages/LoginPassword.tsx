import { useState, useEffect, useReducer } from "react";
import { assert } from "keycloakify/tools/assert";
import { getKcClsx, type KcClsx } from "keycloakify/login/lib/kcClsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { Form, FormGroup } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Small } from "@/components/typography";

export const LoginPassword = (
	props: PageProps<
		Extract<KcContext, { pageId: "login-password.ftl" }>,
		I18n
	>,
) => {
	const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

	const { kcClsx } = getKcClsx({
		doUseDefaultCss,
		classes,
	});

	const { realm, url, messagesPerField } = kcContext;

	const { msg, msgStr } = i18n;

	const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);

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
			headerNode={msg("doLogIn")}
			displayMessage={!messagesPerField.existsError("password")}>
			<Form onSubmit={onSubmit} action={url.loginAction} method="POST">
				<FormGroup>
					<Label htmlFor="password">{msg("password")}</Label>

					<PasswordWrapper
						kcClsx={kcClsx}
						i18n={i18n}
						passwordInputId="password">
						<Input
							tabIndex={2}
							id="password"
							className={kcClsx("kcInputClass")}
							name="password"
							type="password"
							autoFocus
							autoComplete="on"
							isError={messagesPerField.existsError(
								"username",
								"password",
							)}
						/>
					</PasswordWrapper>
					{messagesPerField.existsError("password") && (
						<Small aria-live="polite">
							{messagesPerField.getFirstError("password")}
						</Small>
					)}
				</FormGroup>

				<FormGroup>
					{realm.resetPasswordAllowed && (
						<Button variant="secondary" className="w-full">
							<a tabIndex={6} href={url.loginResetCredentialsUrl}>
								{msg("doForgotPassword")}
							</a>
						</Button>
					)}
					<Button
						className="w-full cursor-pointer"
						disabled={isLoginButtonDisabled}
						tabIndex={4}
						asChild>
						<input
							name="login"
							type="submit"
							value={msgStr("doLogIn")}
							disabled={isLoginButtonDisabled}
						/>
					</Button>
				</FormGroup>
			</Form>
		</Template>
	);
};

const PasswordWrapper = (props: {
	kcClsx: KcClsx;
	i18n: I18n;
	passwordInputId: string;
	children: JSX.Element;
}) => {
	const { i18n, passwordInputId, children } = props;

	const { msgStr } = i18n;

	const [isPasswordRevealed, toggleIsPasswordRevealed] = useReducer(
		(isPasswordRevealed: boolean) => !isPasswordRevealed,
		false,
	);

	useEffect(() => {
		const passwordInputElement = document.getElementById(passwordInputId);

		assert(passwordInputElement instanceof HTMLInputElement);

		passwordInputElement.type = isPasswordRevealed ? "text" : "password";
	}, [isPasswordRevealed]);

	const onClickTogglePassword: React.MouseEventHandler<
		HTMLButtonElement
	> = event => {
		event.preventDefault();

		toggleIsPasswordRevealed();
	};

	return (
		<div className="flex gap-1">
			<div className="w-full">{children}</div>
			<Button
				variant="outline"
				size="icon"
				className="w-max"
				onClick={onClickTogglePassword}
				aria-label={msgStr(
					isPasswordRevealed ? "hidePassword" : "showPassword",
				)}
				aria-controls={passwordInputId}>
				{isPasswordRevealed && (
					<Eye aria-hidden className="h-5 m-2 w-auto" />
				)}
				{!isPasswordRevealed && (
					<EyeOff aria-hidden className="h-5 m-2 w-auto" />
				)}
			</Button>
		</div>
	);
};
