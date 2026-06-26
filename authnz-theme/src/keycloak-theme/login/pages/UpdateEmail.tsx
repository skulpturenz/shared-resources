import { useState } from "react";
import type { LazyOrNot } from "keycloakify/tools/LazyOrNot";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import type { UserProfileFormFieldsProps } from "keycloakify/login/UserProfileFormFieldsProps";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormGroup } from "@/components/ui/form";
import { Label } from "@/components/ui/label";

type UpdateEmailProps = PageProps<
	Extract<KcContext, { pageId: "update-email.ftl" }>,
	I18n
> & {
	UserProfileFormFields: LazyOrNot<
		(props: UserProfileFormFieldsProps) => React.JSX.Element
	>;
	doMakeUserConfirmPassword: boolean;
};

export function UpdateEmail(props: UpdateEmailProps) {
	const {
		kcContext,
		i18n,
		doUseDefaultCss,
		Template,
		classes,
		UserProfileFormFields,
		doMakeUserConfirmPassword,
	} = props;

	const { kcClsx } = getKcClsx({
		doUseDefaultCss,
		classes,
	});

	const { msg, msgStr } = i18n;

	const [isFormSubmittable, setIsFormSubmittable] = useState(false);

	const { url, messagesPerField, isAppInitiatedAction } = kcContext;

	return (
		<Template
			kcContext={kcContext}
			i18n={i18n}
			doUseDefaultCss={doUseDefaultCss}
			classes={classes}
			displayMessage={messagesPerField.exists("global")}
			displayRequiredFields={false}
			headerNode={msg("updateEmailTitle")}>
			<Form
				id="kc-update-email-form"
				action={url.loginAction}
				method="post">
				<UserProfileFormFields
					kcContext={kcContext}
					i18n={i18n}
					kcClsx={kcClsx}
					onIsFormSubmittableValueChange={setIsFormSubmittable}
					doMakeUserConfirmPassword={doMakeUserConfirmPassword}
				/>

				<FormGroup>
					<LogoutOtherSessions i18n={i18n} />

					<Button
						className="w-full cursor-pointer"
						disabled={!isFormSubmittable}
						asChild>
						<input
							disabled={!isFormSubmittable}
							type="submit"
							value={msgStr("doSubmit")}
						/>
					</Button>
					{isAppInitiatedAction && (
						<Button
							variant="secondary"
							className="mt-2 w-full"
							type="submit"
							name="cancel-aia"
							value="true">
							{msg("doCancel")}
						</Button>
					)}
				</FormGroup>
			</Form>
		</Template>
	);
}

function LogoutOtherSessions(props: { i18n: I18n }) {
	const { i18n } = props;

	const { msg } = i18n;

	return (
		<div id="kc-form-options" className="flex items-center gap-2">
			<Checkbox
				id="logout-sessions"
				name="logout-sessions"
				value="on"
				defaultChecked={true}
			/>
			<Label htmlFor="logout-sessions">
				{msg("logoutOtherSessions")}
			</Label>
		</div>
	);
}
