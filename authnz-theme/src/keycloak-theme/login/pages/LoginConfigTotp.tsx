import { getKcClsx, type KcClsx } from "keycloakify/login/lib/kcClsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { P, Small, Ul } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Form, FormGroup } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const LoginConfigTotp = (
	props: PageProps<
		Extract<KcContext, { pageId: "login-config-totp.ftl" }>,
		I18n
	>,
) => {
	const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

	const { kcClsx } = getKcClsx({
		doUseDefaultCss,
		classes,
	});

	const { url, isAppInitiatedAction, totp, mode, messagesPerField } =
		kcContext;

	const { msg, msgStr, advancedMsg } = i18n;

	return (
		<Template
			kcContext={kcContext}
			i18n={i18n}
			doUseDefaultCss={doUseDefaultCss}
			classes={classes}
			headerNode={msg("loginTotpTitle")}
			displayMessage={!messagesPerField.existsError("totp", "userLabel")}>
			<>
				<P>
					<b>{msg("loginTotpStep1")}</b>
				</P>
				<Ul>
					{totp.supportedApplications.map(app => (
						<li key={app}>
							<P>{advancedMsg(app)}</P>
						</li>
					))}
				</Ul>

				{mode === "manual" && (
					<>
						<div className="flex flex-col gap-2">
							<P>
								<b>{msg("loginTotpManualStep2")}</b>
								<br />
								{totp.totpSecretEncoded}
							</P>
							<P>
								<b>{msg("loginTotpManualStep3")}</b>
								<br />
								<Ul>
									<li>
										{msg("loginTotpType")}:&nbsp;
										{msg(`loginTotp.${totp.policy.type}`)}
									</li>
									<li>
										{msg("loginTotpAlgorithm")}:&nbsp;
										{totp.policy.getAlgorithmKey()}
									</li>
									<li>
										{msg("loginTotpDigits")}:&nbsp;
										{totp.policy.digits}
									</li>
									{totp.policy.type === "totp" && (
										<li>
											{msg("loginTotpInterval")}:&nbsp;
											{totp.policy.period}
										</li>
									)}
									{totp.policy.type !== "totp" && (
										<li>
											{msg("loginTotpCounter")}:&nbsp;
											{totp.policy.initialCounter}
										</li>
									)}
								</Ul>
							</P>
							<Button className="w-full" asChild>
								<a href={totp.qrUrl} id="mode-barcode">
									{msg("loginTotpScanBarcode")}
								</a>
							</Button>
						</div>
					</>
				)}

				{mode !== "manual" && (
					<>
						<div className="flex flex-col items-center justify-center gap-4">
							<img
								className="max-w-md rounded-sm ring-2 ring-primary ring-offset-2 ring-offset-background"
								src={`data:image/png;base64, ${totp.totpSecretQrCode}`}
								alt="Figure: Barcode"
							/>
							<Small>{msg("loginTotpStep2")}</Small>
						</div>
						<br />
						<Button className="w-full" asChild>
							<a href={totp.manualUrl}>
								{msg("loginTotpUnableToScan")}
							</a>
						</Button>
					</>
				)}

				<Form className="mt-6" action={url.loginAction} method="POST">
					<P>{msg("loginTotpStep3DeviceName")}</P>
					<FormGroup>
						<Label htmlFor="totp">
							{msg("authenticatorCode")}*
						</Label>
						<Input
							type="text"
							id="totp"
							name="totp"
							autoComplete="off"
							aria-invalid={messagesPerField.existsError("totp")}
							isError={messagesPerField.existsError("totp")}
						/>
						{messagesPerField.existsError("totp") && (
							<Small aria-live="polite">
								{messagesPerField.get("totp")}
							</Small>
						)}
						<Input
							type="hidden"
							id="totpSecret"
							name="totpSecret"
							value={totp.totpSecret}
						/>
						{mode && <Input type="hidden" id="mode" value={mode} />}
					</FormGroup>

					<FormGroup>
						<Label htmlFor="userLabel">
							{msg("loginTotpDeviceName")}
							{totp.otpCredentials.length >= 1 && "*"}
						</Label>
						<Input
							type="text"
							id="userLabel"
							name="userLabel"
							autoComplete="off"
							aria-invalid={messagesPerField.existsError(
								"userLabel",
							)}
							isError={messagesPerField.existsError("userLabel")}
						/>
						{messagesPerField.existsError("userLabel") && (
							<Small aria-live="polite">
								{messagesPerField.get("userLabel")}
							</Small>
						)}
					</FormGroup>

					<LogoutOtherSessions kcClsx={kcClsx} i18n={i18n} />

					{isAppInitiatedAction && (
						<>
							<input
								type="submit"
								className={kcClsx(
									"kcButtonClass",
									"kcButtonPrimaryClass",
									"kcButtonLargeClass",
								)}
								id="saveTOTPBtn"
								value={msgStr("doSubmit")}
							/>
							<button
								type="submit"
								className={kcClsx(
									"kcButtonClass",
									"kcButtonDefaultClass",
									"kcButtonLargeClass",
									"kcButtonLargeClass",
								)}
								id="cancelTOTPBtn"
								name="cancel-aia"
								value="true">
								{msg("doCancel")}
							</button>
						</>
					)}
					{!isAppInitiatedAction && (
						<Button>
							<input type="submit" value={msgStr("doSubmit")} />
						</Button>
					)}
				</Form>
			</>
		</Template>
	);
};

const LogoutOtherSessions = (props: { kcClsx: KcClsx; i18n: I18n }) => {
	const { i18n } = props;

	const { msg } = i18n;

	return (
		<FormGroup flexDirection="row">
			<Checkbox
				name="logout-sessions"
				id="logout-sessions"
				value="on"
				defaultChecked
			/>
			<Label htmlFor="logout-sessions">
				{msg("logoutOtherSessions")}
			</Label>
		</FormGroup>
	);
};
