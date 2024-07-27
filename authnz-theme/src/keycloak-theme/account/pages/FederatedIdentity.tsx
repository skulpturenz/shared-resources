import type { PageProps } from "keycloakify/account/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Large } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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

			<div className="flex gap-2">
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

						<button>
							<Card className="h-32 w-52 grid grid-rows-2">
								<CardHeader>
									<CardTitle className="text-left">
										{identity.displayName}{" "}
										{identity.userName
											? `(${identity.userName})`
											: ""}
									</CardTitle>
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

			{/* <table className="table-auto w-full">
				<thead>
					<tr className="text-left">
						<th className="font-medium">Display name</th>

						<th className="font-medium">User name</th>

						<th className="font-medium invisible">Action</th>
					</tr>
				</thead>

				<tbody>
					{federatedIdentity.identities.map(identity => (
						<tr>
							<td>
								<label
									key={identity.providerId}
									htmlFor={identity.providerId}
									className="control-label">
									{identity.displayName}
								</label>
							</td>

							<td>
								<span>{identity.userName}</span>
							</td>

							{identity.connected &&
								federatedIdentity.removeLinkPossible && (
									<td>
										<form
											action={url.socialUrl}
											method="POST">
											<input
												type="hidden"
												name="stateChecker"
												value={stateChecker}
											/>
											<input
												type="hidden"
												name="action"
												value="remove"
											/>
											<input
												type="hidden"
												name="providerId"
												value={identity.providerId}
											/>

											<Button
												key={identity.providerId}
												id={`remove-link-${identity.providerId}`}
												variant="destructive"
												className="w-full">
												{msg("doRemove")}
											</Button>
										</form>
									</td>
								)}

							{!identity.connected && (
								<td>
									<form action={url.socialUrl} method="POST">
										<input
											type="hidden"
											name="stateChecker"
											value={stateChecker}
										/>
										<input
											type="hidden"
											name="action"
											value="add"
										/>
										<input
											type="hidden"
											name="providerId"
											value={identity.providerId}
										/>

										<Button
											id={`add-link-${identity.providerId}`}
											className="w-full">
											{msg("doAdd")}
										</Button>
									</form>
								</td>
							)}
						</tr>
					))}
				</tbody>
			</table> */}
			{/* <div className="main-layout social">
				<div className="row">
					<div className="col-md-10">
						<h2>{msg("federatedIdentitiesHtmlTitle")}</h2>
					</div>
				</div>
				<div id="federated-identities">
					{federatedIdentity.identities.map(identity => (
						<div
							key={identity.providerId}
							className="row margin-bottom">
							<div className="col-sm-2 col-md-2">
								<label
									htmlFor={identity.providerId}
									className="control-label">
									{identity.displayName}
								</label>
							</div>
							<div className="col-sm-5 col-md-5">
								<input
									disabled
									className="form-control"
									value={identity.userName}
								/>
							</div>
							<div className="col-sm-5 col-md-5">
								{identity.connected ? (
									federatedIdentity.removeLinkPossible && (
										<form
											action={url.socialUrl}
											method="post"
											className="form-inline">
											<input
												type="hidden"
												name="stateChecker"
												value={stateChecker}
											/>
											<input
												type="hidden"
												name="action"
												value="remove"
											/>
											<input
												type="hidden"
												name="providerId"
												value={identity.providerId}
											/>
											<button
												id={`remove-link-${identity.providerId}`}
												className="btn btn-default">
												{msg("doRemove")}
											</button>
										</form>
									)
								) : (
									<form
										action={url.socialUrl}
										method="post"
										className="form-inline">
										<input
											type="hidden"
											name="stateChecker"
											value={stateChecker}
										/>
										<input
											type="hidden"
											name="action"
											value="add"
										/>
										<input
											type="hidden"
											name="providerId"
											value={identity.providerId}
										/>
										<button
											id={`add-link-${identity.providerId}`}
											className="btn btn-default">
											{msg("doAdd")}
										</button>
									</form>
								)}
							</div>
						</div>
					))}
				</div>
			</div> */}
		</Template>
	);
};
