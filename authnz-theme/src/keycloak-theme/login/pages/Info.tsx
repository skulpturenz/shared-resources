import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { P } from "@/components/typography";
import { Button } from "@/components/ui/button";

export const Info = (
	props: PageProps<Extract<KcContext, { pageId: "info.ftl" }>, I18n>,
) => {
	const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

	const { advancedMsgStr, msg } = i18n;

	const {
		messageHeader,
		message,
		requiredActions,
		skipLink,
		pageRedirectUri,
		actionUri,
		client,
	} = kcContext;

	const requiredActionsLabels = requiredActions?.map(action =>
		advancedMsgStr(`requiredAction.${action}`),
	);

	const NavigateButton = () => {
		if (skipLink) {
			return null;
		}

		if (pageRedirectUri) {
			return (
				<Button asChild>
					<a href={pageRedirectUri}>{msg("backToApplication")}</a>
				</Button>
			);
		}

		if (actionUri) {
			return (
				<Button asChild>
					<a href={actionUri}>{msg("proceedWithAction")}</a>
				</Button>
			);
		}

		if (client.baseUrl) {
			return (
				<Button asChild>
					<a href={client.baseUrl}>{msg("backToApplication")}</a>
				</Button>
			);
		}

		return null;
	};

	return (
		<Template
			kcContext={kcContext}
			i18n={i18n}
			doUseDefaultCss={doUseDefaultCss}
			classes={classes}
			displayMessage={false}
			headerNode={
				<span
					dangerouslySetInnerHTML={{
						__html: messageHeader ?? message.summary,
					}}
				/>
			}>
			<div className="flex flex-col gap-4">
				{!requiredActionsLabels && <P>{message.summary}</P>}

				{requiredActionsLabels && (
					<P>
						{message.summary}
						<span className="font-bold">
							{requiredActionsLabels.join(", ")}
						</span>
					</P>
				)}

				<NavigateButton />
			</div>
		</Template>
	);
};
