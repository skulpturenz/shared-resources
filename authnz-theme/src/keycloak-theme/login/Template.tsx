import React, { useEffect } from "react";
import { assert } from "keycloakify/tools/assert";
import { clsx } from "keycloakify/tools/clsx";
import type { TemplateProps } from "keycloakify/login/TemplateProps";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import { useInsertScriptTags } from "keycloakify/tools/useInsertScriptTags";
import { useInsertLinkTags } from "keycloakify/tools/useInsertLinkTags";
import { useSetClassName } from "keycloakify/tools/useSetClassName";
import type { I18n } from "./i18n";
import type { KcContext } from "./KcContext";
import { ThemeProvider, useTheme } from "@/components/ui/theme-provider";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
	Sun,
	Moon,
	CircleAlert,
	CircleX,
	Info,
	CircleCheck,
	RotateCcw,
} from "lucide-react";
import {
	logoLight,
	logoDark,
	logoGoogle,
	logoMicrosoft,
	logoFacebook,
	logoInstagram,
	logoTwitter,
	logoLinkedin,
	logoStackoverflow,
	logoGithub,
	logoGitlab,
	logoBitbucket,
	logoPaypal,
	logoOpenshift,
} from "@/components/assets";
import { Label } from "@/components/ui/label";

export const Template = (props: TemplateProps<KcContext, I18n>) => (
	<ThemeProvider defaultTheme="dark" storageKey="ui-theme">
		<TemplateWithoutTheme {...props} />
	</ThemeProvider>
);

const SOCIAL_PROVIDERS_LABELS = {
	"social-google": "Google",
	"social-microsoft": "Microsoft",
	"social-facebook": "Facebook",
	"social-instagram": "Instagram",
	"social-twitter": "Twitter",
	"social-linkedin": "LinkedIn",
	"social-stackoverflow": "StackOverflow",
	"social-github": "GitHub",
	"social-gitlab": "GitLab",
	"social-bitbucket": "Bitbucket",
	"social-paypal": "PayPal",
	"social-openshift": "OpenShift",
};
const SOCIAL_PROVIDERS_ICONS = {
	"social-google": logoGoogle,
	"social-microsoft": logoMicrosoft,
	"social-facebook": logoFacebook,
	"social-instagram": logoInstagram,
	"social-twitter": logoTwitter,
	"social-linkedin": logoLinkedin,
	"social-stackoverflow": logoStackoverflow,
	"social-github": logoGithub,
	"social-gitlab": logoGitlab,
	"social-bitbucket": logoBitbucket,
	"social-paypal": logoPaypal,
	"social-openshift": logoOpenshift,
};
const TemplateWithoutTheme = (props: TemplateProps<KcContext, I18n>) => {
	const {
		displayInfo = false,
		displayMessage = true,
		displayRequiredFields = false,
		headerNode,
		socialProvidersNode = null,
		infoNode = null,
		documentTitle,
		bodyClassName,
		kcContext,
		i18n,
		doUseDefaultCss,
		classes,
		children,
	} = props;

	const { theme, setTheme } = useTheme();
	const logo = theme === "light" ? logoLight : logoDark;

	const { kcClsx } = getKcClsx({ doUseDefaultCss, classes });

	const {
		msg,
		msgStr,
		getChangeLocaleUrl,
		labelBySupportedLanguageTag,
		currentLanguageTag,
	} = i18n;

	const {
		realm,
		locale,
		auth,
		url,
		message,
		isAppInitiatedAction,
		authenticationSession,
		scripts,
	} = kcContext;

	useEffect(() => {
		document.title =
			documentTitle ?? msgStr("loginTitle", kcContext.realm.displayName);
	}, []);

	useSetClassName({
		qualifiedName: "html",
		className: kcClsx("kcHtmlClass"),
	});

	useSetClassName({
		qualifiedName: "body",
		className: bodyClassName ?? kcClsx("kcBodyClass"),
	});

	useEffect(() => {
		const { currentLanguageTag } = locale ?? {};

		if (currentLanguageTag === undefined) {
			return;
		}

		const html = document.querySelector("html");
		assert(html !== null);
		html.lang = currentLanguageTag;
	}, []);

	const { areAllStyleSheetsLoaded } = useInsertLinkTags({
		componentOrHookName: "Template",
		hrefs: !doUseDefaultCss
			? []
			: [
					`${url.resourcesCommonPath}/node_modules/@patternfly/patternfly/patternfly.min.css`,
					`${url.resourcesCommonPath}/node_modules/patternfly/dist/css/patternfly.min.css`,
					`${url.resourcesCommonPath}/node_modules/patternfly/dist/css/patternfly-additions.min.css`,
					`${url.resourcesCommonPath}/lib/pficon/pficon.css`,
					`${url.resourcesPath}/css/login.css`,
				],
	});

	const { insertScriptTags } = useInsertScriptTags({
		componentOrHookName: "Template",
		scriptTags: [
			{
				type: "module",
				src: `${url.resourcesPath}/js/menu-button-links.js`,
			},
			...(authenticationSession === undefined
				? []
				: [
						{
							type: "module",
							textContent: [
								`import { checkCookiesAndSetTimer } from "${url.resourcesPath}/js/authChecker.js";`,
								``,
								`checkCookiesAndSetTimer(`,
								`  "${authenticationSession.authSessionId}",`,
								`  "${authenticationSession.tabId}",`,
								`  "${url.ssoLoginInOtherTabsUrl}"`,
								`);`,
							].join("\n"),
						} as const,
					]),
			...scripts.map(
				script =>
					({
						type: "text/javascript",
						src: script,
					}) as const,
			),
		],
	});

	useEffect(() => {
		if (areAllStyleSheetsLoaded) {
			insertScriptTags();
		}
	}, [areAllStyleSheetsLoaded]);

	if (!areAllStyleSheetsLoaded) {
		return null;
	}

	if (realm.internationalizationEnabled) {
		assert(locale !== undefined);
	}

	const localizationOptions =
		locale?.supported.map(locale => ({
			value: locale.languageTag,
			label: labelBySupportedLanguageTag[locale.languageTag],
		})) ?? [];
	const currentLocalizationOption = localizationOptions.find(
		option => option.value === currentLanguageTag,
	);

	const onClickLightTheme = () => setTheme("light");
	const onClickDarkTheme = () => setTheme("dark");
	const onClickSystemTheme = () => setTheme("system");
	const onChangeLocale = (next: ComboboxOption | null) => {
		if (!next) {
			return;
		}

		// TODO: <a> is more appropriate
		location.href = getChangeLocaleUrl(next.value.toString());
	};

	const PageHeader = () => {
		if (!auth?.showUsername && !displayRequiredFields) {
			return headerNode;
		}

		return (
			<div className="flex flex-col gap-2">
				<Label>{auth?.attemptedUsername}</Label>
				<a
					href={url.loginRestartFlowUrl}
					aria-label={msgStr("restartLoginTooltip")}>
					<div className="flex items-center gap-1">
						<RotateCcw className="h-4 w-4" />
						<span>{msg("restartLoginTooltip")}</span>
					</div>
				</a>
			</div>
		);
	};

	const toPlainText = (rawHtml: string) => {
		const tempNode = document.createElement("div");

		tempNode.innerHTML = rawHtml;

		const text = tempNode.textContent || tempNode.innerText || "";

		tempNode.remove();

		return text.replace(/\.(?=\w+\s)/gi, ". ");
	};

	const flattenChildren = (
		node: React.ReactNode,
		maxDepth = Infinity,
		currentDepth = 0,
	): React.ReactNode[] => {
		if (currentDepth >= maxDepth) {
			return (node as React.ReactElement)?.props?.children ?? [];
		}

		if (
			!node ||
			typeof node !== "object" ||
			!(node as React.ReactElement).props.children ||
			typeof (node as React.ReactElement)?.props?.children !== "object"
		) {
			return [node];
		}

		const element = node as React.ReactElement;

		if (!Array.isArray(element.props.children)) {
			return flattenChildren(
				element.props.children,
				maxDepth,
				currentDepth + 1,
			);
		}

		return (element.props.children as React.ReactNode[])
			.flatMap(child =>
				flattenChildren(child, maxDepth, currentDepth + 1),
			)
			.filter(Boolean);
	};
	const socialProviders = flattenChildren(socialProvidersNode, 3)
		.filter(child => React.isValidElement(child) && child.type === "a")
		.map(child => {
			return {
				id: (child as React.ReactElement).props.id,
				href: (child as React.ReactElement).props.href,
			};
		});

	return (
		<div
			className={clsx("my-20 flex flex-col items-center justify-center")}>
			<div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 m-4">
				<img
					className="w-72 h-auto"
					src={logo}
					alt={"Skulpture"} // TODO: resources
				/>
				<span
					className={clsx(
						"hidden md:block font-light text-7xl pb-4",
					)}>
					/
				</span>
				<span
					className={clsx(
						"uppercase md:lowercase font-semibold md:font-bold text-2xl md:text-5xl md:pb-2",
					)}>
					{msg("loginTitleHtml", realm.displayNameHtml)}
				</span>
			</div>

			<div className={clsx("w-4/5")}>
				<Card>
					<CardHeader className="flex flex-col gap-2">
						{localizationOptions.length > 0 && (
							<div className="flex md:justify-end gap-2">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="outline" size="icon">
											<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
											<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
											<span className="sr-only">
												Toggle theme
											</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem
											onClick={onClickLightTheme}>
											Light
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={onClickDarkTheme}>
											Dark
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={onClickSystemTheme}>
											System
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>

								{/* TODO: unable to select option for some reason, unsure if from storybook */}
								<Combobox
									className="w-full md:max-w-xs"
									options={localizationOptions}
									initialValue={currentLocalizationOption}
									selectPlaceholder="Select language" // TODO: resources
									searchPlaceholder="Search language..." // TODO: resources
									noResultsText="No language found" // TODO: resources
									onChange={onChangeLocale}
								/>
							</div>
						)}
						<CardTitle className="flex flex-col gap-2">
							{!displayRequiredFields && <PageHeader />}

							{displayRequiredFields && (
								<div
									className={kcClsx("kcContentWrapperClass")}>
									<div
										className={clsx(
											kcClsx("kcLabelWrapperClass"),
											"subtitle",
										)}>
										<span className="subtitle">
											<span className="required">*</span>
											{msg("requiredFields")}
										</span>
									</div>
									<div className="col-md-10">
										<PageHeader />
									</div>
								</div>
							)}

							{displayMessage &&
								message &&
								(message.type !== "warning" ||
									!isAppInitiatedAction) && (
									<CardDescription className="flex gap-1 items-center">
										<span className="hidden md:block">
											{message.type === "success" && (
												<CircleCheck className="h-4 w-4" />
											)}
											{message.type === "warning" && (
												<CircleAlert className="h-4 w-4" />
											)}
											{message.type === "error" && (
												<CircleX className="h-4 w-4" />
											)}
											{message.type === "info" && (
												<Info className="h-4 w-4" />
											)}
										</span>

										{toPlainText(message.summary)}
									</CardDescription>
								)}
						</CardTitle>
					</CardHeader>
					<CardContent>{children}</CardContent>
					<CardFooter className="flex-col gap-8">
						{auth !== undefined && auth.showTryAnotherWayLink && (
							<form
								id="kc-select-try-another-way-form"
								action={url.loginAction}
								method="post">
								<div className={kcClsx("kcFormGroupClass")}>
									<div className={kcClsx("kcFormGroupClass")}>
										<input
											type="hidden"
											name="tryAnotherWay"
											value="on"
										/>
										<a
											href="#"
											id="try-another-way"
											onClick={() => {
												document.forms[
													"kc-select-try-another-way-form" as never
												].submit();
												return false;
											}}>
											{msg("doTryAnotherWay")}
										</a>
									</div>
								</div>
							</form>
						)}
						<div className="grid grid-flow-row grid-rows-2 md:grid-cols-3 gap-4">
							{socialProviders.map(socialProvider => {
								return (
									<Button
										key={socialProvider.id}
										asChild
										className="px-5 py-6">
										<a
											className="flex gap-2 items-center"
											href={socialProvider.href}>
											<img
												className="w-5 h-auto"
												src={
													SOCIAL_PROVIDERS_ICONS[
														socialProvider.id as keyof typeof SOCIAL_PROVIDERS_LABELS
													]
												}
											/>
											{
												SOCIAL_PROVIDERS_LABELS[
													socialProvider.id as keyof typeof SOCIAL_PROVIDERS_LABELS
												]
											}
										</a>
									</Button>
								);
							})}
						</div>
						{displayInfo && (
							<div
								id="kc-info"
								className={kcClsx("kcSignUpClass")}>
								<div
									id="kc-info-wrapper"
									className={kcClsx(
										"kcInfoAreaWrapperClass",
									)}>
									{infoNode}
								</div>
							</div>
						)}
					</CardFooter>
				</Card>
			</div>
		</div>
	);

	return (
		<div className={kcClsx("kcLoginClass")}>
			<div id="kc-header" className={kcClsx("kcHeaderClass")}>
				<div
					id="kc-header-wrapper"
					className={kcClsx("kcHeaderWrapperClass")}>
					{msg("loginTitleHtml", realm.displayNameHtml)}
				</div>
			</div>

			<div className={kcClsx("kcFormCardClass")}>
				<header className={kcClsx("kcFormHeaderClass")}>
					{realm.internationalizationEnabled &&
						(assert(locale !== undefined),
						locale.supported.length > 1) && (
							<div
								className={kcClsx("kcLocaleMainClass")}
								id="kc-locale">
								<div
									id="kc-locale-wrapper"
									className={kcClsx("kcLocaleWrapperClass")}>
									<div
										id="kc-locale-dropdown"
										className={clsx(
											"menu-button-links",
											kcClsx("kcLocaleDropDownClass"),
										)}>
										<button
											tabIndex={1}
											id="kc-current-locale-link"
											aria-label={msgStr("languages")}
											aria-haspopup="true"
											aria-expanded="false"
											aria-controls="language-switch1">
											{
												labelBySupportedLanguageTag[
													currentLanguageTag
												]
											}
										</button>
										<ul
											role="menu"
											tabIndex={-1}
											aria-labelledby="kc-current-locale-link"
											aria-activedescendant=""
											id="language-switch1"
											className={kcClsx(
												"kcLocaleListClass",
											)}>
											{locale.supported.map(
												({ languageTag }, i) => (
													<li
														key={languageTag}
														className={kcClsx(
															"kcLocaleListItemClass",
														)}
														role="none">
														<a
															role="menuitem"
															id={`language-${i + 1}`}
															className={kcClsx(
																"kcLocaleItemClass",
															)}
															href={getChangeLocaleUrl(
																languageTag,
															)}>
															{
																labelBySupportedLanguageTag[
																	languageTag
																]
															}
														</a>
													</li>
												),
											)}
										</ul>
									</div>
								</div>
							</div>
						)}
					{(() => {
						const node = !(
							auth !== undefined &&
							auth.showUsername &&
							!auth.showResetCredentials
						) ? (
							<h1 id="kc-page-title">{headerNode}</h1>
						) : (
							<div
								id="kc-username"
								className={kcClsx("kcFormGroupClass")}>
								<label id="kc-attempted-username">
									{auth.attemptedUsername}
								</label>
								<a
									id="reset-login"
									href={url.loginRestartFlowUrl}
									aria-label={msgStr("restartLoginTooltip")}>
									<div className="kc-login-tooltip">
										<i
											className={kcClsx(
												"kcResetFlowIcon",
											)}></i>
										<span className="kc-tooltip-text">
											{msg("restartLoginTooltip")}
										</span>
									</div>
								</a>
							</div>
						);

						if (displayRequiredFields) {
							return (
								<div
									className={kcClsx("kcContentWrapperClass")}>
									<div
										className={clsx(
											kcClsx("kcLabelWrapperClass"),
											"subtitle",
										)}>
										<span className="subtitle">
											<span className="required">*</span>
											{msg("requiredFields")}
										</span>
									</div>
									<div className="col-md-10">{node}</div>
								</div>
							);
						}

						return node;
					})()}
				</header>
				<div id="kc-content">
					<div id="kc-content-wrapper">
						{/* App-initiated actions should not see warning messages about the need to complete the action during login. */}
						{displayMessage &&
							message !== undefined &&
							(message.type !== "warning" ||
								!isAppInitiatedAction) && (
								<div
									className={clsx(
										`alert-${message.type}`,
										kcClsx("kcAlertClass"),
										`pf-m-${message?.type === "error" ? "danger" : message.type}`,
									)}>
									<div className="pf-c-alert__icon">
										{message.type === "success" && (
											<span
												className={kcClsx(
													"kcFeedbackSuccessIcon",
												)}></span>
										)}
										{message.type === "warning" && (
											<span
												className={kcClsx(
													"kcFeedbackWarningIcon",
												)}></span>
										)}
										{message.type === "error" && (
											<span
												className={kcClsx(
													"kcFeedbackErrorIcon",
												)}></span>
										)}
										{message.type === "info" && (
											<span
												className={kcClsx(
													"kcFeedbackInfoIcon",
												)}></span>
										)}
									</div>
									<span
										className={kcClsx("kcAlertTitleClass")}
										dangerouslySetInnerHTML={{
											__html: message.summary,
										}}
									/>
								</div>
							)}
						{children}
						{auth !== undefined && auth.showTryAnotherWayLink && (
							<form
								id="kc-select-try-another-way-form"
								action={url.loginAction}
								method="post">
								<div className={kcClsx("kcFormGroupClass")}>
									<div className={kcClsx("kcFormGroupClass")}>
										<input
											type="hidden"
											name="tryAnotherWay"
											value="on"
										/>
										<a
											href="#"
											id="try-another-way"
											onClick={() => {
												document.forms[
													"kc-select-try-another-way-form" as never
												].submit();
												return false;
											}}>
											{msg("doTryAnotherWay")}
										</a>
									</div>
								</div>
							</form>
						)}
						{socialProvidersNode}
						{displayInfo && (
							<div
								id="kc-info"
								className={kcClsx("kcSignUpClass")}>
								<div
									id="kc-info-wrapper"
									className={kcClsx(
										"kcInfoAreaWrapperClass",
									)}>
									{infoNode}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
