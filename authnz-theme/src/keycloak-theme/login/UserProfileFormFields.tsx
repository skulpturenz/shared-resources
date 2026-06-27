import { useEffect, useReducer, Fragment } from "react";
import { assert } from "tsafe/assert";
import type { KcClsx } from "keycloakify/login/lib/kcClsx";
import {
	useUserProfileForm,
	getButtonToDisplayForMultivaluedAttributeField,
	type FormAction,
	type FormFieldError,
} from "keycloakify/login/lib/useUserProfileForm";
import type { UserProfileFormFieldsProps } from "keycloakify/login/UserProfileFormFieldsProps";
import type { Attribute } from "keycloakify/login/KcContext";
import type { KcContext } from "./KcContext";
import type { I18n } from "./i18n";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormGroup } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Small } from "@/components/typography";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

const nativeInputClassName =
	"flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

const invalidInputClassName = "border-red-500 focus-visible:ring-red-500";

const hiddenFields = new Set(["locale"]);

const fieldOrder = [
	"firstName",
	"lastName",
	"username",
	"email",
	"password",
	"password-confirm",
];

export const UserProfileFormFields = (
	props: UserProfileFormFieldsProps<KcContext, I18n>,
) => {
	const {
		kcContext,
		i18n,
		kcClsx,
		onIsFormSubmittableValueChange,
		doMakeUserConfirmPassword,
		BeforeField,
		AfterField,
	} = props;

	const { advancedMsg } = i18n;

	const {
		formState: { formFieldStates, isFormSubmittable },
		dispatchFormAction,
	} = useUserProfileForm({
		kcContext,
		i18n,
		doMakeUserConfirmPassword,
	});

	useEffect(() => {
		onIsFormSubmittableValueChange(isFormSubmittable);
		/* eslint-disable react-hooks/exhaustive-deps */
	}, [isFormSubmittable]);

	const groupNameRef = { current: "" };
	const visibleFormFieldStates = formFieldStates
		.filter(
			formFieldState => !hiddenFields.has(formFieldState.attribute.name),
		)
		.sort((a, b) => {
			const PRESERVE_ORDER = 0;

			const aIdx = fieldOrder.findIndex(x => a.attribute.name === x);
			const bIdx = fieldOrder.findIndex(x => b.attribute.name === x);

			if (~aIdx && ~bIdx) {
				return aIdx - bIdx;
			}

			return PRESERVE_ORDER;
		});

	return (
		<div className="flex w-full flex-col gap-6">
			{visibleFormFieldStates.map(
				({ attribute, displayableErrors, valueOrValues }) => {
					return (
						<Fragment key={attribute.name}>
							<GroupLabel
								attribute={attribute}
								groupNameRef={groupNameRef}
								i18n={i18n}
								kcClsx={kcClsx}
							/>
							{BeforeField !== undefined && (
								<BeforeField
									attribute={attribute}
									dispatchFormAction={dispatchFormAction}
									displayableErrors={displayableErrors}
									valueOrValues={valueOrValues}
									kcClsx={kcClsx}
									i18n={i18n}
								/>
							)}
							<FormGroup
								className="!flex w-full !flex-col !gap-2"
								style={{
									display:
										attribute.name === "password-confirm" &&
										!doMakeUserConfirmPassword
											? "none"
											: undefined,
								}}>
								<div className="flex items-center gap-1 leading-none">
									<Label htmlFor={attribute.name}>
										{advancedMsg(
											attribute.displayName ?? "",
										)}
									</Label>
								</div>
								{attribute.annotations.inputHelperTextBefore !==
									undefined && (
									<Small
										className="text-muted-foreground"
										id={`form-help-text-before-${attribute.name}`}
										aria-live="polite">
										{advancedMsg(
											attribute.annotations
												.inputHelperTextBefore,
										)}
									</Small>
								)}
								<InputFiledByType
									attribute={attribute}
									valueOrValues={valueOrValues}
									displayableErrors={displayableErrors}
									dispatchFormAction={dispatchFormAction}
									kcClsx={kcClsx}
									i18n={i18n}
								/>
								<FieldErrors
									attribute={attribute}
									displayableErrors={displayableErrors}
									fieldIndex={undefined}
								/>
								{attribute.annotations.inputHelperTextAfter !==
									undefined && (
									<Small
										className="text-muted-foreground"
										id={`form-help-text-after-${attribute.name}`}
										aria-live="polite">
										{advancedMsg(
											attribute.annotations
												.inputHelperTextAfter,
										)}
									</Small>
								)}

								{AfterField !== undefined && (
									<AfterField
										attribute={attribute}
										dispatchFormAction={dispatchFormAction}
										displayableErrors={displayableErrors}
										valueOrValues={valueOrValues}
										kcClsx={kcClsx}
										i18n={i18n}
									/>
								)}
								{/* NOTE: Downloading of html5DataAnnotations scripts is done in the useUserProfileForm hook */}
							</FormGroup>
						</Fragment>
					);
				},
			)}
		</div>
	);
};

const GroupLabel = (props: {
	attribute: Attribute;
	groupNameRef: {
		current: string;
	};
	i18n: I18n;
	kcClsx: KcClsx;
}) => {
	const { attribute, groupNameRef, i18n } = props;

	const { advancedMsg } = i18n;

	if (attribute.group?.name !== groupNameRef.current) {
		groupNameRef.current = attribute.group?.name ?? "";

		if (groupNameRef.current !== "") {
			assert(attribute.group !== undefined);

			return (
				<FormGroup
					{...Object.fromEntries(
						Object.entries(
							attribute.group.html5DataAnnotations,
						).map(([key, value]) => [`data-${key}`, value]),
					)}>
					{(() => {
						const groupDisplayHeader =
							attribute.group.displayHeader ?? "";
						const groupHeaderText =
							groupDisplayHeader !== ""
								? advancedMsg(groupDisplayHeader)
								: attribute.group.name;

						return (
							<div>
								<Label
									id={`header-${attribute.group.name}`}
									className="text-base font-semibold">
									{groupHeaderText}
								</Label>
							</div>
						);
					})()}
					{(() => {
						const groupDisplayDescription =
							attribute.group.displayDescription ?? "";

						if (groupDisplayDescription !== "") {
							const groupDescriptionText = advancedMsg(
								groupDisplayDescription,
							);

							return (
								<div>
									<Small
										id={`description-${attribute.group.name}`}
										className="text-muted-foreground">
										{groupDescriptionText}
									</Small>
								</div>
							);
						}

						return null;
					})()}
				</FormGroup>
			);
		}
	}

	return null;
};

const FieldErrors = (props: {
	attribute: Attribute;
	displayableErrors: FormFieldError[];
	fieldIndex: number | undefined;
}) => {
	const { attribute, fieldIndex } = props;

	const displayableErrors = props.displayableErrors.filter(
		error => error.fieldIndex === fieldIndex,
	);

	if (displayableErrors.length === 0) {
		return null;
	}

	return (
		<Small
			id={`input-error-${attribute.name}${fieldIndex === undefined ? "" : `-${fieldIndex}`}`}
			className="text-red-500"
			aria-live="polite">
			{displayableErrors
				.filter(error => error.fieldIndex === fieldIndex)
				.map(({ errorMessage }, i, arr) => (
					<Fragment key={i}>
						{errorMessage}
						{arr.length - 1 !== i && <br />}
					</Fragment>
				))}
		</Small>
	);
};

type InputFiledByTypeProps = {
	attribute: Attribute;
	valueOrValues: string | string[];
	displayableErrors: FormFieldError[];
	dispatchFormAction: React.Dispatch<FormAction>;
	i18n: I18n;
	kcClsx: KcClsx;
};

const InputFiledByType = (props: InputFiledByTypeProps) => {
	const { attribute, valueOrValues } = props;

	switch (attribute.annotations.inputType) {
		case "textarea":
			return <TextareaTag {...props} />;
		case "select":
		case "multiselect":
			return <SelectTag {...props} />;
		case "select-radiobuttons":
		case "multiselect-checkboxes":
			return <InputTagSelects {...props} />;
		default: {
			if (valueOrValues instanceof Array) {
				return (
					<>
						{valueOrValues.map((...[, i]) => (
							<InputTag key={i} {...props} fieldIndex={i} />
						))}
					</>
				);
			}

			const inputNode = <InputTag {...props} fieldIndex={undefined} />;

			if (
				attribute.name === "password" ||
				attribute.name === "password-confirm"
			) {
				return (
					<PasswordWrapper
						i18n={props.i18n}
						passwordInputId={attribute.name}>
						{inputNode}
					</PasswordWrapper>
				);
			}

			return inputNode;
		}
	}
};

const PasswordWrapper = (props: {
	i18n: I18n;
	passwordInputId: string;
	children: React.JSX.Element;
}) => {
	const { i18n, passwordInputId, children } = props;

	const { msgStr } = i18n;

	const [isPasswordRevealed, toggleIsPasswordRevealed] = useReducer(
		(isPasswordRevealed: boolean) => !isPasswordRevealed,
		false,
	);

	useEffect(() => {
		const passwordInputElement = document.getElementById(passwordInputId);

		assert(passwordInputElement instanceof HTMLInputElement);

		passwordInputElement.type = isPasswordRevealed ? "text" : "password";
		/* eslint-disable react-hooks/exhaustive-deps */
	}, [isPasswordRevealed]);

	const onClickTogglePassword: React.MouseEventHandler<
		HTMLButtonElement
	> = event => {
		event.preventDefault();

		toggleIsPasswordRevealed();
	};

	return (
		<div className="flex w-full items-start gap-2">
			<div className="w-full">{children}</div>
			<Button
				variant="outline"
				size="icon"
				className="w-max"
				aria-label={msgStr(
					isPasswordRevealed ? "hidePassword" : "showPassword",
				)}
				aria-controls={passwordInputId}
				onClick={onClickTogglePassword}>
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

const InputTag = (
	props: InputFiledByTypeProps & { fieldIndex: number | undefined },
) => {
	const {
		attribute,
		fieldIndex,
		dispatchFormAction,
		valueOrValues,
		i18n,
		displayableErrors,
	} = props;

	return (
		<>
			<Input
				type={(() => {
					const { inputType } = attribute.annotations;

					if (
						attribute.name === "password" ||
						attribute.name === "password-confirm"
					) {
						return "password";
					}

					if (inputType?.startsWith("html5-")) {
						return inputType.slice(6);
					}

					return inputType ?? "text";
				})()}
				id={attribute.name}
				name={attribute.name}
				className="w-full"
				value={(() => {
					if (fieldIndex !== undefined) {
						assert(valueOrValues instanceof Array);
						return valueOrValues[fieldIndex];
					}

					assert(typeof valueOrValues === "string");

					return valueOrValues;
				})()}
				isError={
					displayableErrors.find(
						error => error.fieldIndex === fieldIndex,
					) !== undefined
				}
				disabled={attribute.readOnly}
				autoComplete={attribute.autocomplete}
				placeholder={attribute.annotations.inputTypePlaceholder}
				pattern={attribute.annotations.inputTypePattern}
				size={
					attribute.annotations.inputTypeSize === undefined
						? undefined
						: parseInt(`${attribute.annotations.inputTypeSize}`)
				}
				maxLength={
					attribute.annotations.inputTypeMaxlength === undefined
						? undefined
						: parseInt(
								`${attribute.annotations.inputTypeMaxlength}`,
							)
				}
				minLength={
					attribute.annotations.inputTypeMinlength === undefined
						? undefined
						: parseInt(
								`${attribute.annotations.inputTypeMinlength}`,
							)
				}
				max={attribute.annotations.inputTypeMax}
				min={attribute.annotations.inputTypeMin}
				step={attribute.annotations.inputTypeStep}
				{...Object.fromEntries(
					Object.entries(attribute.html5DataAnnotations ?? {}).map(
						([key, value]) => [`data-${key}`, value],
					),
				)}
				onChange={event =>
					dispatchFormAction({
						action: "update",
						name: attribute.name,
						valueOrValues: (() => {
							if (fieldIndex !== undefined) {
								assert(valueOrValues instanceof Array);

								return valueOrValues.map((value, i) => {
									if (i === fieldIndex) {
										return event.target.value;
									}

									return value;
								});
							}

							return event.target.value;
						})(),
					})
				}
				onBlur={() =>
					dispatchFormAction({
						action: "focus lost",
						name: attribute.name,
						fieldIndex: fieldIndex,
					})
				}
			/>
			{(() => {
				if (fieldIndex === undefined) {
					return null;
				}

				assert(valueOrValues instanceof Array);

				const values = valueOrValues;

				return (
					<>
						<FieldErrors
							attribute={attribute}
							displayableErrors={displayableErrors}
							fieldIndex={fieldIndex}
						/>
						<AddRemoveButtonsMultiValuedAttribute
							attribute={attribute}
							values={values}
							fieldIndex={fieldIndex}
							dispatchFormAction={dispatchFormAction}
							i18n={i18n}
						/>
					</>
				);
			})()}
		</>
	);
};

const AddRemoveButtonsMultiValuedAttribute = (props: {
	attribute: Attribute;
	values: string[];
	fieldIndex: number;
	dispatchFormAction: React.Dispatch<
		Extract<FormAction, { action: "update" }>
	>;
	i18n: I18n;
}) => {
	const { attribute, values, fieldIndex, dispatchFormAction, i18n } = props;

	const { msg } = i18n;

	const { hasAdd, hasRemove } =
		getButtonToDisplayForMultivaluedAttributeField({
			attribute,
			values,
			fieldIndex,
		});

	const idPostfix = `-${attribute.name}-${fieldIndex + 1}`;

	return (
		<div className="flex flex-wrap gap-2">
			{hasRemove && (
				<Button variant="secondary" size="sm" asChild>
					<button
						id={`kc-remove${idPostfix}`}
						type="button"
						onClick={() =>
							dispatchFormAction({
								action: "update",
								name: attribute.name,
								valueOrValues: values.filter(
									(_, i) => i !== fieldIndex,
								),
							})
						}>
						{msg("remove")}
					</button>
				</Button>
			)}
			{hasAdd && (
				<Button variant="secondary" size="sm" asChild>
					<button
						id={`kc-add${idPostfix}`}
						type="button"
						onClick={() =>
							dispatchFormAction({
								action: "update",
								name: attribute.name,
								valueOrValues: [...values, ""],
							})
						}>
						{msg("addValue")}
					</button>
				</Button>
			)}
		</div>
	);
};

const InputTagSelects = (props: InputFiledByTypeProps) => {
	const { attribute, dispatchFormAction, valueOrValues } = props;

	const { advancedMsg } = props.i18n;

	const inputType = (() => {
		const { inputType } = attribute.annotations;

		assert(
			inputType === "select-radiobuttons" ||
				inputType === "multiselect-checkboxes",
		);

		switch (inputType) {
			case "select-radiobuttons":
				return "radio";
			case "multiselect-checkboxes":
				return "checkbox";
		}
	})();

	const options = (() => {
		walk: {
			const { inputOptionsFromValidation } = attribute.annotations;

			if (inputOptionsFromValidation === undefined) {
				break walk;
			}

			const validator = (
				attribute.validators as Record<string, { options?: string[] }>
			)[inputOptionsFromValidation];

			if (validator === undefined) {
				break walk;
			}

			if (validator.options === undefined) {
				break walk;
			}

			return validator.options;
		}

		return attribute.validators.options?.options ?? [];
	})();

	return (
		<div className="flex w-full flex-col gap-2">
			{options.map(option => (
				<div key={option} className="flex items-center gap-2">
					{inputType === "checkbox" && (
						<Checkbox
							id={`${attribute.name}-${option}`}
							name={attribute.name}
							value={option}
							aria-invalid={props.displayableErrors.length !== 0}
							disabled={attribute.readOnly}
							checked={
								valueOrValues instanceof Array
									? valueOrValues.includes(option)
									: valueOrValues === option
							}
							onCheckedChange={checked =>
								dispatchFormAction({
									action: "update",
									name: attribute.name,
									valueOrValues: (() => {
										const isChecked = checked === true;

										if (valueOrValues instanceof Array) {
											if (isChecked) {
												return valueOrValues.includes(
													option,
												)
													? valueOrValues
													: [
															...valueOrValues,
															option,
														];
											} else {
												return valueOrValues.filter(
													value => value !== option,
												);
											}
										}

										return isChecked ? option : "";
									})(),
								})
							}
							onBlur={() =>
								dispatchFormAction({
									action: "focus lost",
									name: attribute.name,
									fieldIndex: undefined,
								})
							}
						/>
					)}
					{inputType === "radio" && (
						<input
							type="radio"
							id={`${attribute.name}-${option}`}
							name={attribute.name}
							value={option}
							className="h-4 w-4 accent-primary disabled:cursor-not-allowed disabled:opacity-50"
							aria-invalid={props.displayableErrors.length !== 0}
							disabled={attribute.readOnly}
							checked={valueOrValues === option}
							onChange={event =>
								dispatchFormAction({
									action: "update",
									name: attribute.name,
									valueOrValues: event.target.checked
										? option
										: "",
								})
							}
							onBlur={() =>
								dispatchFormAction({
									action: "focus lost",
									name: attribute.name,
									fieldIndex: undefined,
								})
							}
						/>
					)}
					<Label
						htmlFor={`${attribute.name}-${option}`}
						className={cn(
							attribute.readOnly &&
								"cursor-not-allowed opacity-50",
						)}>
						{advancedMsg(option)}
					</Label>
				</div>
			))}
		</div>
	);
};

const TextareaTag = (props: InputFiledByTypeProps) => {
	const { attribute, dispatchFormAction, displayableErrors, valueOrValues } =
		props;

	assert(typeof valueOrValues === "string");

	const value = valueOrValues;

	return (
		<textarea
			id={attribute.name}
			name={attribute.name}
			className={cn(
				nativeInputClassName,
				"w-full",
				"min-h-24 resize-y",
				displayableErrors.length !== 0 && invalidInputClassName,
			)}
			aria-invalid={displayableErrors.length !== 0}
			disabled={attribute.readOnly}
			cols={
				attribute.annotations.inputTypeCols === undefined
					? undefined
					: parseInt(`${attribute.annotations.inputTypeCols}`)
			}
			rows={
				attribute.annotations.inputTypeRows === undefined
					? undefined
					: parseInt(`${attribute.annotations.inputTypeRows}`)
			}
			maxLength={
				attribute.annotations.inputTypeMaxlength === undefined
					? undefined
					: parseInt(`${attribute.annotations.inputTypeMaxlength}`)
			}
			value={value}
			onChange={event =>
				dispatchFormAction({
					action: "update",
					name: attribute.name,
					valueOrValues: event.target.value,
				})
			}
			onBlur={() =>
				dispatchFormAction({
					action: "focus lost",
					name: attribute.name,
					fieldIndex: undefined,
				})
			}
		/>
	);
};

const SelectTag = (props: InputFiledByTypeProps) => {
	const {
		attribute,
		dispatchFormAction,
		displayableErrors,
		i18n,
		valueOrValues,
	} = props;

	const { advancedMsg } = i18n;

	const isMultiple = attribute.annotations.inputType === "multiselect";

	return (
		<select
			id={attribute.name}
			name={attribute.name}
			className={cn(
				nativeInputClassName,
				"w-full",
				isMultiple && "h-auto min-h-24 py-2",
				displayableErrors.length !== 0 && invalidInputClassName,
			)}
			aria-invalid={displayableErrors.length !== 0}
			disabled={attribute.readOnly}
			multiple={isMultiple}
			size={
				attribute.annotations.inputTypeSize === undefined
					? undefined
					: parseInt(`${attribute.annotations.inputTypeSize}`)
			}
			value={valueOrValues}
			onChange={event =>
				dispatchFormAction({
					action: "update",
					name: attribute.name,
					valueOrValues: (() => {
						if (isMultiple) {
							return Array.from(event.target.selectedOptions).map(
								option => option.value,
							);
						}

						return event.target.value;
					})(),
				})
			}
			onBlur={() =>
				dispatchFormAction({
					action: "focus lost",
					name: attribute.name,
					fieldIndex: undefined,
				})
			}>
			{!isMultiple && <option value=""></option>}
			{(() => {
				const options = (() => {
					walk: {
						const { inputOptionsFromValidation } =
							attribute.annotations;

						if (inputOptionsFromValidation === undefined) {
							break walk;
						}

						assert(typeof inputOptionsFromValidation === "string");

						const validator = (
							attribute.validators as Record<
								string,
								{ options?: string[] }
							>
						)[inputOptionsFromValidation];

						if (validator === undefined) {
							break walk;
						}

						if (validator.options === undefined) {
							break walk;
						}

						return validator.options;
					}

					return attribute.validators.options?.options ?? [];
				})();

				return options.map(option => (
					<option key={option} value={option}>
						{(() => {
							if (
								attribute.annotations.inputOptionLabels !==
								undefined
							) {
								const { inputOptionLabels } =
									attribute.annotations;

								return advancedMsg(
									inputOptionLabels[option] ?? option,
								);
							}

							if (
								attribute.annotations
									.inputOptionLabelsI18nPrefix !== undefined
							) {
								return advancedMsg(
									`${attribute.annotations.inputOptionLabelsI18nPrefix}.${option}`,
								);
							}

							return option;
						})()}
					</option>
				));
			})()}
		</select>
	);
};
