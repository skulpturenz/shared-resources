import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { clsx } from "clsx";
import { P, Small, Ul } from "@/components/typography";
import { Button } from "@/components/ui/button";

export const LoginOauthGrant = (
	props: PageProps<
		Extract<KcContext, { pageId: "login-oauth-grant.ftl" }>,
		I18n
	>,
) => {
	const { kcContext, i18n, doUseDefaultCss, classes, Template } = props;
	const { url, oauth, client } = kcContext;

	const { msg, msgStr, advancedMsg, advancedMsgStr } = i18n;

	return (
		<Template
			kcContext={kcContext}
			i18n={i18n}
			doUseDefaultCss={doUseDefaultCss}
			classes={classes}
			bodyClassName="oauth"
			headerNode={
				<div
					className={clsx(
						"flex flex-col gap-2",
						client.attributes.logoUri
							? "items-center"
							: "items-start",
					)}>
					{client.attributes.logoUri && (
						<img
							className="h-40 w-auto"
							src={client.attributes.logoUri}
						/>
					)}
					{client.name
						? msg("oauthGrantTitle", advancedMsgStr(client.name))
						: msg("oauthGrantTitle", client.clientId)}
				</div>
			}>
			<P>
				<b>{msg("oauthGrantRequest")}</b>
			</P>
			<Ul>
				{oauth.clientScopesRequested.map(clientScope => (
					<li key={clientScope.consentScreenText}>
						<P>
							{advancedMsg(clientScope.consentScreenText)}
							{clientScope.dynamicScopeParameter && (
								<>
									:&nbsp;
									<b>{clientScope.dynamicScopeParameter}</b>
								</>
							)}
						</P>
					</li>
				))}
			</Ul>

			{(client.attributes.tosUri || client.attributes.policyUri) && (
				<>
					<Small>
						{client.name &&
							msg(
								"oauthGrantInformation",
								advancedMsgStr(client.name),
							)}
						{!client.name &&
							msg("oauthGrantInformation", client.clientId)}
					</Small>
					<div className="flex flex-col items-start mt-2">
						{client.attributes.tosUri && (
							<Button variant="link" size={null} asChild>
								<a
									href={client.attributes.tosUri}
									target="_blank"
									rel="noopener noreferrer">
									{msg("oauthGrantReview")}&nbsp;
									{msg("oauthGrantTos")}
								</a>
							</Button>
						)}
						{client.attributes.policyUri && (
							<Button variant="link" size={null} asChild>
								<a
									href={client.attributes.policyUri}
									target="_blank">
									{msg("oauthGrantReview")}&nbsp;
									{msg("oauthGrantPolicy")}
								</a>
							</Button>
						)}
					</div>
				</>
			)}

			<form
				action={url.oauthAction}
				method="POST"
				className="mt-8 flex gap-2">
				<input type="hidden" name="code" value={oauth.code} />
				<Button className="w-full cursor-pointer" asChild>
					<input
						name="accept"
						type="submit"
						value={msgStr("doYes")}
					/>
				</Button>
				<Button
					variant="secondary"
					className="w-full cursor-pointer"
					asChild>
					<input name="cancel" type="submit" value={msgStr("doNo")} />
				</Button>
			</form>
		</Template>
	);
};
