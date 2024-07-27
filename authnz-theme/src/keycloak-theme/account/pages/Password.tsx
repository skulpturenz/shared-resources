import React from "react";
import { clsx } from "keycloakify/tools/clsx";
import { getKcClsx, type KcClsx } from "keycloakify/account/lib/kcClsx";
import type { PageProps } from "keycloakify/account/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Large } from "@/components/typography";
import { Form, FormGroup } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { assert } from "tsafe/assert";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

export default function Password(
	props: PageProps<Extract<KcContext, { pageId: "password.ftl" }>, I18n>,
) {
	const { kcContext, i18n, doUseDefaultCss, Template } = props;

	const classes = {
		...props.classes,
		kcBodyClass: clsx(props.classes?.kcBodyClass, "password"),
	};

	const { kcClsx } = getKcClsx({
		doUseDefaultCss,
		classes,
	});

	const { url, password, account, stateChecker } = kcContext;

	const { msgStr, msg } = i18n;

	const [currentPassword, setCurrentPassword] = React.useState("");
	const [newPassword, setNewPassword] = React.useState("");
	const [newPasswordConfirm, setNewPasswordConfirm] = React.useState("");
	const [newPasswordError, setNewPasswordError] = React.useState("");
	const [newPasswordConfirmError, setNewPasswordConfirmError] =
		React.useState("");
	const [hasNewPasswordBlurred, setHasNewPasswordBlurred] =
		React.useState(false);
	const [hasNewPasswordConfirmBlurred, setHasNewPasswordConfirmBlurred] =
		React.useState(false);

	const checkNewPassword = (newPassword: string) => {
		if (!password.passwordSet) {
			return;
		}

		if (newPassword === currentPassword) {
			setNewPasswordError(msgStr("newPasswordSameAsOld"));
		} else {
			setNewPasswordError("");
		}
	};

	const checkNewPasswordConfirm = (newPasswordConfirm: string) => {
		if (newPasswordConfirm === "") {
			return;
		}

		if (newPassword !== newPasswordConfirm) {
			setNewPasswordConfirmError(msgStr("passwordConfirmNotMatch"));
		} else {
			setNewPasswordConfirmError("");
		}
	};

	return (
		<Template
			{...{
				kcContext: {
					...kcContext,
					message: (() => {
						if (newPasswordError !== "") {
							return {
								type: "error",
								summary: newPasswordError,
							};
						}

						if (newPasswordConfirmError !== "") {
							return {
								type: "error",
								summary: newPasswordConfirmError,
							};
						}

						return kcContext.message;
					})(),
				},
				i18n,
				doUseDefaultCss,
				classes,
			}}
			active="password">
			<Form action={url.passwordUrl} method="POST">
				<Large>{msgStr("changePasswordHtmlTitle")}</Large>

				<div className="hidden">
					<Input
						type="text"
						name="username"
						value={account.username}
						autoComplete="username"
						readOnly
						className="hidden"
					/>
					<Input
						type="hidden"
						name="stateChecker"
						value={stateChecker}
					/>
				</div>

				{password.passwordSet && (
					<FormGroup>
						<Label htmlFor="password">{msg("password")}*</Label>
						<PasswordWrapper
							kcClsx={kcClsx}
							i18n={i18n}
							passwordInputId="password">
							<Input
								type="password"
								id="password"
								name="password"
								autoFocus
								autoComplete="current-password"
								value={currentPassword}
								onChange={event =>
									setCurrentPassword(event.target.value)
								}
							/>
						</PasswordWrapper>
					</FormGroup>
				)}

				<FormGroup>
					<Label htmlFor="password-new">{msg("passwordNew")}*</Label>
					<PasswordWrapper
						kcClsx={kcClsx}
						i18n={i18n}
						passwordInputId="password-new">
						<Input
							type="password"
							id="password-new"
							name="password-new"
							autoComplete="new-password"
							value={newPassword}
							onChange={event => {
								const newPassword = event.target.value;

								setNewPassword(newPassword);
								if (hasNewPasswordBlurred) {
									checkNewPassword(newPassword);
								}
							}}
							onBlur={() => {
								setHasNewPasswordBlurred(true);
								checkNewPassword(newPassword);
							}}
						/>
					</PasswordWrapper>
				</FormGroup>

				<FormGroup>
					<Label htmlFor="password-confirm">
						{msg("passwordConfirm")}*
					</Label>
					<PasswordWrapper
						kcClsx={kcClsx}
						i18n={i18n}
						passwordInputId="password-confirm">
						<Input
							type="password"
							id="password-confirm"
							name="password-confirm"
							autoComplete="new-password"
							value={newPasswordConfirm}
							onChange={event => {
								const newPasswordConfirm = event.target.value;

								setNewPasswordConfirm(newPasswordConfirm);
								if (hasNewPasswordConfirmBlurred) {
									checkNewPasswordConfirm(newPasswordConfirm);
								}
							}}
							onBlur={() => {
								setHasNewPasswordConfirmBlurred(true);
								checkNewPasswordConfirm(newPasswordConfirm);
							}}
						/>
					</PasswordWrapper>
				</FormGroup>

				<FormGroup>
					<Button
						disabled={
							newPasswordError !== "" ||
							newPasswordConfirmError !== ""
						}
						type="submit"
						name="submitAction"
						value="Save">
						{msg("doSave")}
					</Button>
				</FormGroup>
			</Form>
		</Template>
	);
}

const PasswordWrapper = (props: {
	kcClsx: KcClsx;
	i18n: I18n;
	passwordInputId: string;
	children: JSX.Element;
}) => {
	const { i18n, passwordInputId, children } = props;

	const { msgStr } = i18n;

	const [isPasswordRevealed, toggleIsPasswordRevealed] = React.useReducer(
		(isPasswordRevealed: boolean) => !isPasswordRevealed,
		false,
	);

	React.useEffect(() => {
		const passwordInputElement = document.getElementById(passwordInputId);

		assert(passwordInputElement instanceof HTMLInputElement);

		passwordInputElement.type = isPasswordRevealed ? "text" : "password";
	}, [isPasswordRevealed]);

	const onClickTogglePassword: React.MouseEventHandler<
		HTMLButtonElement
	> = event => {
		event.preventDefault();

		toggleIsPasswordRevealed();
	};

	return (
		<div className="flex gap-2">
			<div className="w-full">{children}</div>
			<Button
				variant="outline"
				size="icon"
				className="w-max"
				onClick={onClickTogglePassword}
				aria-label={msgStr(
					isPasswordRevealed ? "hidePassword" : "showPassword",
				)}
				aria-controls={passwordInputId}>
				{isPasswordRevealed && (
					<Eye aria-hidden className="h-5 m-2 w-auto" />
				)}
				{!isPasswordRevealed && (
					<EyeOff aria-hidden className="h-5 m-2 w-auto" />
				)}
			</Button>
		</div>
	);
};
