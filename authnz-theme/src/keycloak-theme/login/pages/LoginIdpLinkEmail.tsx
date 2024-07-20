import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { P } from "@/components/typography";
import { Button } from "@/components/ui/button";

export const LoginIdpLinkEmail = (
	props: PageProps<
		Extract<KcContext, { pageId: "login-idp-link-email.ftl" }>,
		I18n
	>,
) => {
	const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

	const { url, realm, brokerContext, idpAlias } = kcContext;

	const { msg } = i18n;

	return (
		<Template
			kcContext={kcContext}
			i18n={i18n}
			doUseDefaultCss={doUseDefaultCss}
			classes={classes}
			headerNode={msg("emailLinkIdpTitle", idpAlias)}>
			<P>
				{msg(
					"emailLinkIdp1",
					idpAlias,
					brokerContext.username,
					realm.displayName,
				)}
			</P>
			<P>
				{msg("emailLinkIdp2")}&nbsp;
				<Button variant="link" size={null} asChild>
					<a href={url.loginAction}>
						{msg("doClickHere")}&nbsp;{msg("emailLinkIdp3")}
					</a>
				</Button>
			</P>
			<P>
				{msg("emailLinkIdp4")}&nbsp;
				<Button variant="link" size={null} asChild>
					<a href={url.loginAction}>
						{msg("doClickHere")}&nbsp;{msg("emailLinkIdp5")}
					</a>
				</Button>
			</P>
		</Template>
	);
};
