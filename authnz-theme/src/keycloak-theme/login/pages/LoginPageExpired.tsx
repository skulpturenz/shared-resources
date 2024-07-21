import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Button } from "@/components/ui/button";
import { FormGroup } from "@/components/ui/form";

export const LoginPageExpired = (
	props: PageProps<
		Extract<KcContext, { pageId: "login-page-expired.ftl" }>,
		I18n
	>,
) => {
	const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

	const { url } = kcContext;

	const { msg } = i18n;

	return (
		<Template
			kcContext={kcContext}
			i18n={i18n}
			doUseDefaultCss={doUseDefaultCss}
			classes={classes}
			headerNode={msg("pageExpiredTitle")}>
			<FormGroup flexDirection="row">
				<Button variant="outline" className="w-full">
					<a href={url.loginRestartFlowUrl}>
						{msg("pageExpiredMsg1")}
					</a>
				</Button>
				<Button variant="outline" className="w-full">
					<a href={url.loginAction}>{msg("pageExpiredMsg2")}</a>
				</Button>
			</FormGroup>
		</Template>
	);
};
