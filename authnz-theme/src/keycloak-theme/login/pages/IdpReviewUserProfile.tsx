import { useState } from "react";
import type { LazyOrNot } from "keycloakify/tools/LazyOrNot";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { UserProfileFormFieldsProps } from "keycloakify/login/UserProfileFormFieldsProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Button } from "@/components/ui/button";
import { Form, FormGroup } from "@/components/ui/form";

type IdpReviewUserProfileProps = PageProps<
	Extract<KcContext, { pageId: "idp-review-user-profile.ftl" }>,
	I18n
> & {
	UserProfileFormFields: LazyOrNot<
		(props: UserProfileFormFieldsProps) => React.JSX.Element
	>;
	doMakeUserConfirmPassword: boolean;
};

export function IdpReviewUserProfile(props: IdpReviewUserProfileProps) {
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

	const { url, messagesPerField } = kcContext;

	const [isFomSubmittable, setIsFomSubmittable] = useState(false);

	return (
		<Template
			kcContext={kcContext}
			i18n={i18n}
			doUseDefaultCss={doUseDefaultCss}
			classes={classes}
			displayMessage={messagesPerField.exists("global")}
			displayRequiredFields={false}
			headerNode={msg("loginIdpReviewProfileTitle")}>
			<Form
				id="kc-idp-review-profile-form"
				action={url.loginAction}
				method="post">
				<UserProfileFormFields
					kcContext={kcContext}
					i18n={i18n}
					onIsFormSubmittableValueChange={setIsFomSubmittable}
					kcClsx={kcClsx}
					doMakeUserConfirmPassword={doMakeUserConfirmPassword}
				/>
				<FormGroup>
					<Button
						className="w-full cursor-pointer"
						disabled={!isFomSubmittable}
						asChild>
						<input
							type="submit"
							value={msgStr("doSubmit")}
							disabled={!isFomSubmittable}
						/>
					</Button>
				</FormGroup>
			</Form>
		</Template>
	);
}
