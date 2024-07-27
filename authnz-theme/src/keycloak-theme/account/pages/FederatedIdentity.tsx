import type { PageProps } from "keycloakify/account/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Large } from "@/components/typography";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const FederatedIdentity = (
	props: PageProps<
		Extract<KcContext, { pageId: "federatedIdentity.ftl" }>,
		I18n
	>,
) => {
	const { kcContext, i18n, doUseDefaultCss, classes, Template } = props;

	const { url, federatedIdentity, stateChecker } = kcContext;
	const { msg } = i18n;

	return (
		<Template
			{...{ kcContext, i18n, doUseDefaultCss, classes }}
			active="federatedIdentity">
			<Large>{msg("federatedIdentitiesHtmlTitle")}</Large>

			<div className="grid grid-flow-row sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
				{federatedIdentity.identities.map(identity => (
					<form
						action={url.socialUrl}
						method="POST"
						key={identity.providerId}>
						<input
							type="hidden"
							name="stateChecker"
							value={stateChecker}
						/>
						<input type="hidden" name="action" value="add" />
						<input
							type="hidden"
							name="providerId"
							value={identity.providerId}
						/>

						<button className="w-full">
							<Card className="h-32 gap-6 grid grid-rows-2">
								<CardHeader>
									<CardTitle className="text-left">
										{identity.displayName}
									</CardTitle>
									{identity.userName && (
										<CardDescription className="text-left">
											{identity.userName}
										</CardDescription>
									)}
								</CardHeader>
								<CardFooter>
									<Button
										className="w-full"
										variant={
											identity.connected &&
											federatedIdentity.removeLinkPossible
												? "destructive"
												: "default"
										}
										asChild>
										<span>
											{identity.connected &&
												federatedIdentity.removeLinkPossible &&
												msg("doRemove")}

											{!identity.connected &&
												msg("doAdd")}
										</span>
									</Button>
								</CardFooter>
							</Card>
						</button>
					</form>
				))}
			</div>
		</Template>
	);
};
