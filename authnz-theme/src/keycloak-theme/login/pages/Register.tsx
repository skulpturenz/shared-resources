import { useState } from "react";
import type { LazyOrNot } from "keycloakify/tools/LazyOrNot";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import type { UserProfileFormFieldsProps } from "keycloakify/login/UserProfileFormFieldsProps";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormGroup } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Small } from "@/components/typography";

type RegisterProps = PageProps<
	Extract<KcContext, { pageId: "register.ftl" }>,
	I18n
> & {
	UserProfileFormFields: LazyOrNot<
		(props: UserProfileFormFieldsProps) => React.JSX.Element
	>;
	doMakeUserConfirmPassword: boolean;
};

export const Register = (props: RegisterProps) => {
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

	const {
		url,
		messagesPerField,
		recaptchaRequired,
		recaptchaSiteKey,
		termsAcceptanceRequired,
	} = kcContext;

	const { msg, msgStr } = i18n;

	const [isFormSubmittable, setIsFormSubmittable] = useState(false);
	const [areTermsAccepted, setAreTermsAccepted] = useState(false);

	return (
		<Template
			kcContext={kcContext}
			i18n={i18n}
			doUseDefaultCss={doUseDefaultCss}
			classes={classes}
			headerNode={msg("registerTitle")}
			displayRequiredFields={false}
			displayMessage={messagesPerField.exists("global")}>
			<Form
				id="kc-register-form"
				action={url.registrationAction}
				method="post"
				className="!flex !flex-col !gap-6">
				<UserProfileFormFields
					kcContext={kcContext}
					i18n={i18n}
					kcClsx={kcClsx}
					onIsFormSubmittableValueChange={setIsFormSubmittable}
					doMakeUserConfirmPassword={doMakeUserConfirmPassword}
				/>
				{termsAcceptanceRequired && (
					<TermsAcceptance
						i18n={i18n}
						messagesPerField={messagesPerField}
						areTermsAccepted={areTermsAccepted}
						onAreTermsAcceptedValueChange={setAreTermsAccepted}
					/>
				)}
				{recaptchaRequired && (
					<FormGroup>
						<div
							className="g-recaptcha"
							data-size="compact"
							data-sitekey={recaptchaSiteKey}></div>
					</FormGroup>
				)}
				<FormGroup className="!gap-2">
					<Button
						className="w-full cursor-pointer"
						disabled={
							!isFormSubmittable ||
							(termsAcceptanceRequired && !areTermsAccepted)
						}
						asChild>
						<input
							id="kc-register"
							type="submit"
							value={msgStr("doRegister")}
						/>
					</Button>
					<Button variant="secondary" className="w-full" asChild>
						<a href={url.loginUrl}>{msg("backToLogin")}</a>
					</Button>
				</FormGroup>
			</Form>
		</Template>
	);
};

function TermsAcceptance(props: {
	i18n: I18n;
	messagesPerField: Pick<
		KcContext["messagesPerField"],
		"existsError" | "get"
	>;
	areTermsAccepted: boolean;
	onAreTermsAcceptedValueChange: (areTermsAccepted: boolean) => void;
}) {
	const {
		i18n,
		messagesPerField,
		areTermsAccepted,
		onAreTermsAcceptedValueChange,
	} = props;

	const { msg } = i18n;

	return (
		<>
			<FormGroup>
				<Label className="text-base font-semibold">
					{msg("termsTitle")}
				</Label>
				<div id="kc-registration-terms-text" className="text-sm">
					{msg("termsText")}
				</div>
			</FormGroup>
			<FormGroup>
				<div className="flex flex-row items-center gap-2">
					<Checkbox
						id="termsAccepted"
						name="termsAccepted"
						checked={areTermsAccepted}
						onCheckedChange={checked =>
							onAreTermsAcceptedValueChange(checked === true)
						}
						aria-invalid={messagesPerField.existsError(
							"termsAccepted",
						)}
					/>
					<Label htmlFor="termsAccepted">{msg("acceptTerms")}</Label>
				</div>
				{messagesPerField.existsError("termsAccepted") && (
					<Small
						id="input-error-terms-accepted"
						className="text-red-500"
						aria-live="polite"
						dangerouslySetInnerHTML={{
							__html: kcSanitize(
								messagesPerField.get("termsAccepted"),
							),
						}}
					/>
				)}
			</FormGroup>
		</>
	);
}
