import React from "react";
import { getKcClsx, type KcClsx } from "keycloakify/login/lib/kcClsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { CircleAlert, Copy, Download, Printer } from "lucide-react";
import { Ol, P } from "@/components/typography";
import { Form, FormGroup } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { toast } from "sonner";
import ReactDOMServer from "react-dom/server";
import { Portal } from "@/components/ui/portal";
import { Toaster } from "@/components/ui/sonner";

export const LoginRecoveryAuthnCodeConfig = (
	props: PageProps<
		Extract<KcContext, { pageId: "login-recovery-authn-code-config.ftl" }>,
		I18n
	>,
) => {
	const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

	const { kcClsx } = getKcClsx({
		doUseDefaultCss,
		classes,
	});

	const { recoveryAuthnCodesConfigBean, isAppInitiatedAction } = kcContext;

	const { msg, msgStr } = i18n;

	const [areRecoveryCodesSaved, setAreRecoveryCodesSaved] =
		React.useState(false);
	const onChangeAreRecoveryCodesSaved = (checked: CheckedState) =>
		setAreRecoveryCodesSaved(checked.valueOf() as boolean);

	const onConfirmSavedRecoveryCodes = () => {
		//@ts-expect-error: This is code from the original theme, we trust it.
		document.getElementById(
			"saveRecoveryAuthnCodesBtn",
			//@ts-expect-error: This is code from the original theme, we trust it.
		).disabled = !areRecoveryCodesSaved;
	};

	const formatCurrentDateTime = () => {
		const currentDate = new Date();
		const options: Intl.DateTimeFormatOptions = {
			month: "long",
			day: "numeric",
			year: "numeric",
			hour: "numeric",
			minute: "numeric",
			timeZoneName: "short",
		};

		return currentDate.toLocaleString("en-US", options);
	};

	const onCopyRecoveryCodes = () => {
		const parseRecoveryCodeList = () =>
			Array.from(
				document.querySelectorAll(
					".kc-recovery-codes-list",
				) as NodeListOf<HTMLElement>,
			)
				.map(element => element.innerText)
				.join("\r\n");

		navigator.clipboard.writeText(parseRecoveryCodeList());

		toast(msgStr("recoveryCodesCopied"), {
			description: formatCurrentDateTime(),
		});
	};

	const onDownloadRecoveryCodes = () => {
		const parseRecoveryCodeList = () =>
			Array.from(
				document.querySelectorAll(
					".kc-recovery-codes-list",
				) as NodeListOf<HTMLElement>,
			)
				.map(element => element.innerText)
				.join("\r\n");

		const buildDownloadContent = () =>
			[
				`${msgStr("recovery-codes-download-file-header")}\n`,
				parseRecoveryCodeList(),
				`${msgStr("recovery-codes-download-file-description")}\n`,
				`${msgStr("recovery-codes-download-file-date")} ${formatCurrentDateTime()}`,
			].join("\r\n");

		const setUpDownloadLinkAndDownload = (
			filename: string,
			text: string,
		) => {
			const element = document.createElement("a");

			element.setAttribute(
				"href",
				"data:text/plain;charset=utf-8," + encodeURIComponent(text),
			);
			element.setAttribute("download", filename);
			element.style.display = "none";
			element.click();
			element.remove();
		};

		setUpDownloadLinkAndDownload(
			"download-recovery-codes.txt",
			buildDownloadContent(),
		);

		toast(msgStr("recoveryCodesDownloaded"), {
			description: formatCurrentDateTime(),
		});
	};

	const onPrintRecoveryCodes = () => {
		function buildPrintContent() {
			const recoveryCodeListHTML = document.getElementById(
				"kc-recovery-codes-list",
			)?.innerHTML;
			const styles = `@page { size: auto;  margin-top: 0; }
				body { width: 480px; }
				div { list-style-type: none; font-family: monospace }
				p:first-of-type { margin-top: 48px }`;

			return ReactDOMServer.renderToString(
				<html>
					<head>
						<style>{styles}</style>
						<title>download-recovery-codes</title>
					</head>
					<body>
						<p>{msgStr("recovery-codes-download-file-header")}</p>
						<div
							dangerouslySetInnerHTML={{
								__html: recoveryCodeListHTML ?? "",
							}}
						/>
						<p>
							{msgStr("recovery-codes-download-file-description")}
						</p>
						<p>
							{msgStr("recovery-codes-download-file-date")}&nbsp;
							{formatCurrentDateTime()}
						</p>
					</body>
				</html>,
			);
		}

		function printRecoveryCodes() {
			const w = window.open();
			w?.document.write(buildPrintContent());
			w?.print();
			w?.close();
		}

		printRecoveryCodes();

		toast(msgStr("recoveryCodesPrinted"), {
			description: formatCurrentDateTime(),
		});
	};

	return (
		<Template
			kcContext={kcContext}
			i18n={i18n}
			doUseDefaultCss={doUseDefaultCss}
			classes={classes}
			headerNode={msg("recovery-code-config-header")}>
			<div className="text-muted-foreground">
				<div className="flex gap-2 items-center">
					<span className="hidden md:block">
						<CircleAlert className="h-4 w-4" />
					</span>
					<span>
						{msg("recovery-code-config-warning-title")}.&nbsp;
					</span>
				</div>
				<span>{msg("recovery-code-config-warning-message")}</span>
			</div>

			<Ol
				id="kc-recovery-codes-list"
				className={kcClsx("kcRecoveryCodesList")}>
				{recoveryAuthnCodesConfigBean.generatedRecoveryAuthnCodesList.map(
					code => (
						<li className="kc-recovery-codes-list" key={code}>
							<P>{code.match(/.{1,4}/gi)?.join("-")}</P>
						</li>
					),
				)}
			</Ol>

			<FormGroup flexDirection="row">
				<Button
					id="printRecoveryCodes"
					variant="outline"
					className="w-full flex gap-2"
					onClick={onPrintRecoveryCodes}>
					<Printer className="h-4 w-4" />
					{msg("recovery-codes-print")}
				</Button>
				<Button
					id="downloadRecoveryCodes"
					variant="outline"
					className="w-full flex gap-2"
					onClick={onDownloadRecoveryCodes}>
					<Download className="h-4 w-4" />
					{msg("recovery-codes-download")}
				</Button>
				<Button
					id="copyRecoveryCodes"
					variant="outline"
					className="w-full flex gap-2"
					onClick={onCopyRecoveryCodes}>
					<Copy className="h-4 w-4" />
					{msg("recovery-codes-copy")}
				</Button>
			</FormGroup>

			<FormGroup
				id="kc-recovery-codes-settings-form"
				flexDirection="row"
				className="mt-12 my-6">
				<Checkbox
					id="kcRecoveryCodesConfirmationCheck"
					name="kcRecoveryCodesConfirmationCheck"
					onCheckedChange={onChangeAreRecoveryCodesSaved}
					onChange={onConfirmSavedRecoveryCodes}
				/>
				<Label htmlFor="kcRecoveryCodesConfirmationCheck">
					{msg("recovery-codes-confirmation-message")}
				</Label>
			</FormGroup>

			<Form action={kcContext.url.loginAction} method="POST">
				<div className="hidden">
					<Input
						type="hidden"
						name="generatedRecoveryAuthnCodes"
						value={
							recoveryAuthnCodesConfigBean.generatedRecoveryAuthnCodesAsString
						}
					/>
					<Input
						type="hidden"
						name="generatedAt"
						value={recoveryAuthnCodesConfigBean.generatedAt}
					/>
					<Input
						type="hidden"
						id="userLabel"
						name="userLabel"
						value={msgStr("recovery-codes-label-default")}
					/>
				</div>

				<LogoutOtherSessions kcClsx={kcClsx} i18n={i18n} />

				{isAppInitiatedAction && (
					<FormGroup>
						<Button asChild>
							<input
								type="submit"
								id="saveRecoveryAuthnCodesBtn"
								value={msgStr("recovery-codes-action-complete")}
								disabled
							/>
						</Button>

						<Button
							type="submit"
							id="cancelRecoveryAuthnCodesBtn"
							name="cancel-aia"
							value="true"
							variant="secondary">
							{msg("recovery-codes-action-cancel")}
						</Button>
					</FormGroup>
				)}

				{!isAppInitiatedAction && (
					<Button asChild>
						<input
							type="submit"
							id="saveRecoveryAuthnCodesBtn"
							value={msgStr("recovery-codes-action-complete")}
							disabled
						/>
					</Button>
				)}
			</Form>

			<Portal>
				<Toaster />
			</Portal>
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
