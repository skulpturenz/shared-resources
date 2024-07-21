import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Form, FormGroup } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Small } from "@/components/typography";
import { Button } from "@/components/ui/button";

export const LoginRecoveryAuthnCodeInput = (
	props: PageProps<
		Extract<KcContext, { pageId: "login-recovery-authn-code-input.ftl" }>,
		I18n
	>,
) => {
	const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

	const { url, messagesPerField, recoveryAuthnCodesInputBean } = kcContext;

	const { msg, msgStr } = i18n;

	return (
		<Template
			kcContext={kcContext}
			i18n={i18n}
			doUseDefaultCss={doUseDefaultCss}
			classes={classes}
			headerNode={msg("auth-recovery-code-header")}
			displayMessage={!messagesPerField.existsError("recoveryCodeInput")}>
			<Form action={url.loginAction} method="POST">
				<FormGroup>
					<Label htmlFor="recoveryCodeInput">
						{msg(
							"auth-recovery-code-prompt",
							`${recoveryAuthnCodesInputBean.codeNumber}`,
						)}
					</Label>
					<Input
						tabIndex={1}
						id="recoveryCodeInput"
						name="recoveryCodeInput"
						isError={messagesPerField.existsError(
							"recoveryCodeInput",
						)}
						autoComplete="off"
						type="text"
						autoFocus
					/>
					{messagesPerField.existsError("recoveryCodeInput") && (
						<Small aria-live="polite">
							{messagesPerField.get("recoveryCodeInput")}
						</Small>
					)}
				</FormGroup>

				<FormGroup>
					<Button asChild>
						<input
							name="login"
							type="submit"
							value={msgStr("doLogIn")}
						/>
					</Button>
				</FormGroup>
			</Form>
		</Template>
	);
};
