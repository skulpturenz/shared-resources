import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { P } from "@/components/typography";
import { Button } from "@/components/ui/button";

export const LoginVerifyEmail = (
	props: PageProps<
		Extract<KcContext, { pageId: "login-verify-email.ftl" }>,
		I18n
	>,
) => {
	const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

	const { msg } = i18n;

	const { url, user } = kcContext;

	return (
		<Template
			kcContext={kcContext}
			i18n={i18n}
			doUseDefaultCss={doUseDefaultCss}
			classes={classes}
			displayInfo
			headerNode={msg("emailVerifyTitle")}>
			<P>{msg("emailVerifyInstruction1", user?.email ?? "")}</P>

			<P>
				{msg("emailVerifyInstruction2")}&nbsp;
				<Button variant="link" size={null} asChild>
					<a href={url.loginAction}>
						{msg("doClickHere")}&nbsp;
						{msg("emailVerifyInstruction3")}
					</a>
				</Button>
			</P>
		</Template>
	);
};
