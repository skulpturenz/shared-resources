import { clsx } from "keycloakify/tools/clsx";
import type { PageProps } from "keycloakify/account/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Form, FormGroup } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Large, Small } from "@/components/typography";

export const Account = (
	props: PageProps<Extract<KcContext, { pageId: "account.ftl" }>, I18n>,
) => {
	const { kcContext, i18n, doUseDefaultCss, Template } = props;

	const classes = {
		...props.classes,
		kcBodyClass: clsx(props.classes?.kcBodyClass, "user"),
	};

	const {
		url,
		realm,
		messagesPerField,
		stateChecker,
		account,
		referrer: _referrer,
	} = kcContext;

	const { msg, msgStr } = i18n;

	return (
		<Template
			{...{ kcContext, i18n, doUseDefaultCss, classes }}
			active="account">
			<Large>{msgStr("editAccountHtmlTitle")}</Large>

			<Form action={url.accountUrl} method="POST">
				<div className="hidden">
					<Input
						type="hidden"
						name="stateChecker"
						value={stateChecker}
					/>
				</div>

				<FormGroup>
					<Label htmlFor="username">
						{msg("username")}
						{realm.editUsernameAllowed && "*"}
					</Label>
					<Input
						id="username"
						name="username"
						disabled={!realm.editUsernameAllowed}
						defaultValue={account.username ?? ""}
						isError={messagesPerField.exists("username")}
					/>
					{messagesPerField.existsError("username") && (
						<Small aria-live="polite">
							{messagesPerField.get("username")}
						</Small>
					)}
				</FormGroup>

				<FormGroup>
					<Label htmlFor="email">{msg("email")}*</Label>
					<Input
						id="email"
						type="text"
						name="email"
						autoFocus
						defaultValue={account.email ?? ""}
						isError={messagesPerField.exists("email")}
					/>
					{messagesPerField.existsError("email") && (
						<Small aria-live="polite">
							{messagesPerField.get("email")}
						</Small>
					)}
				</FormGroup>

				<FormGroup>
					<Label htmlFor="firstName">{msg("firstName")}*</Label>
					<Input
						type="text"
						id="firstName"
						name="firstName"
						defaultValue={account.firstName ?? ""}
						isError={messagesPerField.existsError("firstName")}
					/>
					{messagesPerField.existsError("firstName") && (
						<Small aria-live="polite">
							{messagesPerField.get("firstName")}
						</Small>
					)}
				</FormGroup>

				<FormGroup>
					<Label htmlFor="lastName">{msg("lastName")}*</Label>
					<Input
						type="text"
						id="lastName"
						name="lastName"
						defaultValue={account.lastName ?? ""}
						isError={messagesPerField.existsError("lastName")}
					/>
					{messagesPerField.existsError("lastName") && (
						<Small aria-live="polite">
							{messagesPerField.get("lastName")}
						</Small>
					)}
				</FormGroup>

				<FormGroup>
					<Button variant="secondary" className="w-full">
						{msg("backToApplication")}
					</Button>

					<FormGroup flexDirection="row" className="w-full">
						<Button
							type="submit"
							name="submitAction"
							value="Save"
							className="w-full">
							{msg("doSave")}
						</Button>

						<Button
							type="submit"
							name="submitAction"
							value="Cancel"
							variant="destructive"
							className="w-full">
							{msg("doCancel")}
						</Button>
					</FormGroup>
				</FormGroup>
			</Form>
		</Template>
	);
};
