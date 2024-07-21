import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Button } from "@/components/ui/button";
import { Form, FormGroup } from "@/components/ui/form";

export const LoginIdpLinkConfirm = (
	props: PageProps<
		Extract<KcContext, { pageId: "login-idp-link-confirm.ftl" }>,
		I18n
	>,
) => {
	const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

	const { url, idpAlias } = kcContext;

	const { msg } = i18n;

	return (
		<Template
			kcContext={kcContext}
			i18n={i18n}
			doUseDefaultCss={doUseDefaultCss}
			classes={classes}
			headerNode={msg("confirmLinkIdpTitle")}>
			<Form id="kc-register-form" action={url.loginAction} method="POST">
				<FormGroup flexDirection="row">
					<Button
						variant="outline"
						className="w-full"
						type="submit"
						name="submitAction"
						id="updateProfile"
						value="updateProfile">
						{msg("confirmLinkIdpReviewProfile")}
					</Button>
					<Button
						variant="outline"
						className="w-full"
						type="submit"
						name="submitAction"
						id="linkAccount"
						value="linkAccount">
						{msg("confirmLinkIdpContinue", idpAlias)}
					</Button>
				</FormGroup>
			</Form>
		</Template>
	);
};
