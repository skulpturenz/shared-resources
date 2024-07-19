import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { P } from "@/components/typography";
import { Button } from "@/components/ui/button";

export const Error = (
	props: PageProps<Extract<KcContext, { pageId: "error.ftl" }>, I18n>,
) => {
	const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

	const { message, client, skipLink } = kcContext;

	const { msg } = i18n;

	return (
		<Template
			kcContext={kcContext}
			i18n={i18n}
			doUseDefaultCss={doUseDefaultCss}
			classes={classes}
			displayMessage={false}
			headerNode={msg("errorTitle")}>
			<div className="flex flex-col gap-4">
				<P>{message.summary}</P>

				{!skipLink &&
					client !== undefined &&
					client.baseUrl !== undefined && (
						<Button asChild>
							<a href={client.baseUrl}>
								{msg("backToApplication")}
							</a>
						</Button>
					)}
			</div>
		</Template>
	);
};
