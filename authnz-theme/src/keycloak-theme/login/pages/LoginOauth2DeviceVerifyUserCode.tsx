import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormGroup } from "@/components/ui/form";

export const LoginOauth2DeviceVerifyUserCode = (
	props: PageProps<
		Extract<
			KcContext,
			{ pageId: "login-oauth2-device-verify-user-code.ftl" }
		>,
		I18n
	>,
) => {
	const { kcContext, i18n, doUseDefaultCss, classes, Template } = props;
	const { url } = kcContext;

	const { msg, msgStr } = i18n;

	return (
		<Template
			kcContext={kcContext}
			i18n={i18n}
			doUseDefaultCss={doUseDefaultCss}
			classes={classes}
			headerNode={msg("oauth2DeviceVerificationTitle")}>
			<Form action={url.oauth2DeviceVerificationAction} method="POST">
				<FormGroup>
					<Label htmlFor="device-user-code">
						{msg("verifyOAuth2DeviceUserCode")}
					</Label>

					<Input
						id="device-user-code"
						name="device_user_code"
						autoComplete="off"
						type="text"
						autoFocus
					/>
				</FormGroup>

				<Button className="w-full" asChild>
					<input type="submit" value={msgStr("doSubmit")} />
				</Button>
			</Form>
		</Template>
	);
};
