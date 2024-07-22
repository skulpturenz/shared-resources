import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Form, FormGroup } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { P, Small } from "@/components/typography";
import { Button } from "@/components/ui/button";

export const LoginResetPassword = (
	props: PageProps<
		Extract<KcContext, { pageId: "login-reset-password.ftl" }>,
		I18n
	>,
) => {
	const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

	const { url, realm, auth, messagesPerField } = kcContext;

	const { msg, msgStr } = i18n;

	return (
		<Template
			kcContext={kcContext}
			i18n={i18n}
			doUseDefaultCss={doUseDefaultCss}
			classes={classes}
			displayInfo
			displayMessage={!messagesPerField.existsError("username")}
			headerNode={msg("emailForgotTitle")}>
			<Form action={url.loginAction} method="POST">
				<P>
					{realm.duplicateEmailsAllowed &&
						msg("emailInstructionUsername")}
					{!realm.duplicateEmailsAllowed && msg("emailInstruction")}
				</P>

				<FormGroup>
					<Label htmlFor="username">
						{!realm.loginWithEmailAllowed && msg("username")}
						{realm.loginWithEmailAllowed &&
							!realm.registrationEmailAsUsername &&
							msg("usernameOrEmail")}
						{realm.loginWithEmailAllowed &&
							realm.registrationEmailAsUsername &&
							msg("email")}
					</Label>
					<Input
						type="text"
						id="username"
						name="username"
						autoFocus
						defaultValue={auth.attemptedUsername ?? ""}
						isError={messagesPerField.existsError("username")}
					/>
					{messagesPerField.existsError("username") && (
						<Small aria-live="polite">
							{messagesPerField.get("username")}
						</Small>
					)}
				</FormGroup>

				<FormGroup>
					<Button variant="secondary" asChild>
						<a href={url.loginUrl}>{msg("backToLogin")}</a>
					</Button>
					<Button asChild>
						<input type="submit" value={msgStr("doSubmit")} />
					</Button>
				</FormGroup>
			</Form>
		</Template>
	);
};
