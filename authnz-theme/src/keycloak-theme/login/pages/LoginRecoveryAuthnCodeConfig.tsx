import React, { useEffect } from "react";
import { getKcClsx, type KcClsx } from "keycloakify/login/lib/kcClsx";
import { useInsertScriptTags } from "keycloakify/tools/useInsertScriptTags";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { CircleAlert, Copy, Download, Printer } from "lucide-react";
import { Ol } from "@/components/typography";
import { Form, FormGroup } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { CheckedState } from "@radix-ui/react-checkbox";

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

	const { insertScriptTags } = useInsertScriptTags({
		componentOrHookName: "LoginRecoveryAuthnCodeConfig",
		scriptTags: [
			{
				type: "text/javascript",
				textContent: `

                    /* copy recovery codes  */
                    function copyRecoveryCodes() {
                        var tmpTextarea = document.createElement("textarea");
                        var codes = document.getElementById("kc-recovery-codes-list").getElementsByTagName("li");
                        for (i = 0; i < codes.length; i++) {
                            tmpTextarea.value = tmpTextarea.value + codes[i].innerText + "\\n";
                        }
                        document.body.appendChild(tmpTextarea);
                        tmpTextarea.select();
                        document.execCommand("copy");
                        document.body.removeChild(tmpTextarea);
                    }

                    var copyButton = document.getElementById("copyRecoveryCodes");
                    copyButton && copyButton.addEventListener("click", function () {
                        copyRecoveryCodes();
                    });

                    /* download recovery codes  */
                    function formatCurrentDateTime() {
                        var dt = new Date();
                        var options = {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                            timeZoneName: 'short'
                        };

                        return dt.toLocaleString('en-US', options);
                    }

                    function parseRecoveryCodeList() {
                        var recoveryCodes = document.querySelectorAll(".kc-recovery-codes-list li");
                        var recoveryCodeList = "";

                        for (var i = 0; i < recoveryCodes.length; i++) {
                            var recoveryCodeLiElement = recoveryCodes[i].innerText;
                            recoveryCodeList += recoveryCodeLiElement + "\\r\\n";
                        }

                        return recoveryCodeList;
                    }

                    function buildDownloadContent() {
                        var recoveryCodeList = parseRecoveryCodeList();
                        var dt = new Date();
                        var options = {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                            timeZoneName: 'short'
                        };

                        return fileBodyContent =
                            "${msgStr("recovery-codes-download-file-header")}\\n\\n" +
                            recoveryCodeList + "\\n" +
                            "${msgStr("recovery-codes-download-file-description")}\\n\\n" +
                            "${msgStr("recovery-codes-download-file-date")} " + formatCurrentDateTime();
                    }

                    function setUpDownloadLinkAndDownload(filename, text) {
                        var el = document.createElement('a');
                        el.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
                        el.setAttribute('download', filename);
                        el.style.display = 'none';
                        document.body.appendChild(el);
                        el.click();
                        document.body.removeChild(el);
                    }

                    function downloadRecoveryCodes() {
                        setUpDownloadLinkAndDownload('kc-download-recovery-codes.txt', buildDownloadContent());
                    }

                    var downloadButton = document.getElementById("downloadRecoveryCodes");
                    downloadButton && downloadButton.addEventListener("click", downloadRecoveryCodes);

                    /* print recovery codes */
                    function buildPrintContent() {
                        var recoveryCodeListHTML = document.getElementById('kc-recovery-codes-list').innerHTML;
                        var styles =
                            \`@page { size: auto;  margin-top: 0; }
                            body { width: 480px; }
                            div { list-style-type: none; font-family: monospace }
                            p:first-of-type { margin-top: 48px }\`;

                        return printFileContent =
                            "<html><style>" + styles + "</style><body>" +
                            "<title>kc-download-recovery-codes</title>" +
                            "<p>${msgStr("recovery-codes-download-file-header")}</p>" +
                            "<div>" + recoveryCodeListHTML + "</div>" +
                            "<p>${msgStr("recovery-codes-download-file-description")}</p>" +
                            "<p>${msgStr("recovery-codes-download-file-date")} " + formatCurrentDateTime() + "</p>" +
                            "</body></html>";
                    }

                    function printRecoveryCodes() {
                        var w = window.open();
                        w.document.write(buildPrintContent());
                        w.print();
                        w.close();
                    }

                    var printButton = document.getElementById("printRecoveryCodes");
                    printButton && printButton.addEventListener("click", printRecoveryCodes);
                `,
			},
		],
	});

	const [areRecoveryCodesSaved, setAreRecoveryCodesSaved] =
		React.useState(false);
	const onChangeAreRecoveryCodesSaved = (checked: CheckedState) =>
		setAreRecoveryCodesSaved(checked.valueOf() as boolean);

	useEffect(() => {
		insertScriptTags();
	}, []);

	const onConfirmSavedRecoveryCodes = () => {
		//@ts-expect-error: This is code from the original theme, we trust it.
		document.getElementById(
			"saveRecoveryAuthnCodesBtn",
			//@ts-expect-error: This is code from the original theme, we trust it.
		).disabled = !areRecoveryCodesSaved;
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
					(code, index) => (
						<li key={index}>
							<span>{index + 1}:</span> {code.slice(0, 4)}-
							{code.slice(4, 8)}-{code.slice(8)}
						</li>
					),
				)}
			</Ol>

			<FormGroup flexDirection="row">
				<Button variant="outline" className="w-full flex gap-2">
					<Printer className="h-4 w-4" />
					{msg("recovery-codes-print")}
				</Button>
				<Button variant="outline" className="w-full flex gap-2">
					<Download className="h-4 w-4" />
					{msg("recovery-codes-download")}
				</Button>
				<Button variant="outline" className="w-full flex gap-2">
					<Copy className="h-4 w-4" />
					{msg("recovery-codes-copy")}
				</Button>
			</FormGroup>

			<FormGroup flexDirection="row" className="mt-10 my-4">
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
