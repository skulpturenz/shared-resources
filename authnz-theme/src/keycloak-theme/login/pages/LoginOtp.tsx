import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Form, FormGroup } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { Small } from "@/components/typography";
import { clsx } from "clsx";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export const LoginOtp = (
	props: PageProps<Extract<KcContext, { pageId: "login-otp.ftl" }>, I18n>,
) => {
	const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

	const { otpLogin, url, messagesPerField } = kcContext;

	const { msg, msgStr } = i18n;

	return (
		<Template
			kcContext={kcContext}
			i18n={i18n}
			doUseDefaultCss={doUseDefaultCss}
			classes={classes}
			displayMessage={!messagesPerField.existsError("totp")}
			headerNode={msg("doLogIn")}>
			<Form action={url.loginAction} method="POST">
				{otpLogin.userOtpCredentials.length > 1 && (
					<FormGroup>
						<Label htmlFor="device">Device</Label>
						<RadioGroup
							id="device"
							defaultValue={otpLogin.selectedCredentialId}>
							{otpLogin.userOtpCredentials.map(
								userOtpCredential => {
									return (
										<div
											key={userOtpCredential.id}
											className="flex items-center space-x-2">
											<RadioGroupItem
												value={userOtpCredential.id}
												id={userOtpCredential.id}
												name="selectedCredentialId"
											/>
											<Label
												htmlFor={userOtpCredential.id}>
												{userOtpCredential.userLabel}
											</Label>
										</div>
									);
								},
							)}
						</RadioGroup>
					</FormGroup>
				)}

				<FormGroup>
					<Label>{msg("loginOtpOneTime")}</Label>
					<InputOTP
						id="otp"
						name="otp"
						autoComplete="off"
						type="text"
						autoFocus
						aria-invalid={messagesPerField.existsError("totp")}
						maxLength={6}
						containerClassName="grid grid-cols-1">
						<InputOTPGroup className="grid grid-cols-6 h-12">
							<InputOTPSlot
								className={clsx(
									messagesPerField.existsError("totp")
										? "border-red-500 ring-red-500"
										: "",
									"w-full h-full",
								)}
								index={0}
							/>
							<InputOTPSlot
								className={clsx(
									messagesPerField.existsError("totp")
										? "border-red-500 ring-red-500"
										: "",
									"w-full h-full",
								)}
								index={1}
							/>
							<InputOTPSlot
								className={clsx(
									messagesPerField.existsError("totp")
										? "border-red-500 ring-red-500"
										: "",
									"w-full h-full",
								)}
								index={2}
							/>
							<InputOTPSlot
								className={clsx(
									messagesPerField.existsError("totp")
										? "border-red-500 ring-red-500"
										: "",
									"w-full h-full",
								)}
								index={3}
							/>
							<InputOTPSlot
								className={clsx(
									messagesPerField.existsError("totp")
										? "border-red-500 ring-red-500"
										: "",
									"w-full h-full",
								)}
								index={4}
							/>
							<InputOTPSlot
								className={clsx(
									messagesPerField.existsError("totp")
										? "border-red-500 ring-red-500"
										: "",
									"w-full h-full",
								)}
								index={5}
							/>
						</InputOTPGroup>
					</InputOTP>
					{messagesPerField.existsError("totp") && (
						<Small aria-live="polite">
							{messagesPerField.get("totp")}
						</Small>
					)}
				</FormGroup>

				<Button asChild>
					<input
						name="login"
						id="kc-login"
						type="submit"
						value={msgStr("doLogIn")}
					/>
				</Button>
			</Form>
		</Template>
	);
};
