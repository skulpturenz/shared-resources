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
import { Combobox } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
	Sun,
	CircleAlert,
	CircleX,
	Info,
	CircleCheck,
	RotateCcw,
	MoonStar,
} from "lucide-react";
import {
	LogoLight,
	LogoDark,
	LogoGoogle,
	LogoMicrosoft,
	LogoFacebook,
	LogoInstagram,
	LogoTwitter,
	LogoLinkedin,
	LogoStackoverflow,
	LogoGithub,
	LogoGitlab,
	LogoBitbucket,
	LogoPaypal,
	LogoOpenshift,
} from "@/components/assets";
import { Label } from "@/components/ui/label";

export const Template = (props: TemplateProps<KcContext, I18n>) => (
	<ThemeProvider defaultTheme="dark" storageKey="ui-theme">
		<TemplateWithoutTheme {...props} />
	</ThemeProvider>
);

const SSO_PROVIDERS_LABELS = {
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

const SSO_PROVIDERS_ICONS = {
	"social-google": LogoGoogle,
	"social-microsoft": LogoMicrosoft,
	"social-facebook": LogoFacebook,
	"social-instagram": LogoInstagram,
	"social-twitter": LogoTwitter,
	"social-linkedin": LogoLinkedin,
	"social-stackoverflow": LogoStackoverflow,
	"social-github": LogoGithub,
	"social-gitlab": LogoGitlab,
	"social-bitbucket": LogoBitbucket,
	"social-paypal": LogoPaypal,
	"social-openshift": LogoOpenshift,
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
	const Logo = theme === "light" ? LogoLight : LogoDark;

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
			value: labelBySupportedLanguageTag[locale.languageTag],
			label: labelBySupportedLanguageTag[locale.languageTag],
			href: getChangeLocaleUrl(locale.languageTag),
		})) ?? [];
	const currentLocalizationOption = localizationOptions.find(
		option =>
			option.value === labelBySupportedLanguageTag[currentLanguageTag],
	);

	const onClickLightTheme = () => setTheme("light");
	const onClickDarkTheme = () => setTheme("dark");
	const onClickSystemTheme = () => setTheme("system");

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
	const ssoProviders = flattenChildren(socialProvidersNode, 3)
		.filter(child => React.isValidElement(child) && child.type === "a")
		.map(child => {
			return {
				id: (child as React.ReactElement).props.id,
				href: (child as React.ReactElement).props.href,
			};
		});
	const onClickTryAnotherWay = () => {
		document.forms["kc-select-try-another-way-form" as never].submit();

		return false;
	};

	return (
		<div className={"my-20 flex flex-col items-center justify-center"}>
			<div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 m-4">
				<Logo className="w-72 h-auto" />
				<span className="hidden md:block font-light text-7xl pb-4">
					/
				</span>
				<span className="uppercase md:lowercase font-semibold md:font-bold text-2xl md:text-5xl md:pb-2">
					{msg("loginTitleHtml", realm.displayNameHtml)}
				</span>
			</div>

			<div className="w-full max-w-3xl">
				<Card>
					<CardHeader className="flex flex-col gap-2">
						{localizationOptions.length > 0 && (
							<div className="flex md:justify-end gap-2">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="outline" size="icon">
											<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
											<MoonStar className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-primary" />
											<span className="sr-only">
												{msg("toggleTheme")}
											</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem
											onClick={onClickLightTheme}>
											{msg("lightTheme")}
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={onClickDarkTheme}>
											{msg("darkTheme")}
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={onClickSystemTheme}>
											{msg("systemTheme")}
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>

								<Combobox
									className="w-full md:max-w-xs"
									options={localizationOptions}
									initialValue={currentLocalizationOption}
									selectPlaceholder={msgStr("selectLanguage")}
									searchPlaceholder={msgStr("searchLanguage")}
									noResultsText={msgStr("noLanguages")}
								/>
							</div>
						)}
						<CardTitle className="flex flex-col gap-2">
							{!displayRequiredFields && <PageHeader />}

							{displayRequiredFields && (
								<div>
									<div className={"subtitle"}>
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
								method="post"
								className="w-full">
								<div className="w-full">
									<div className="w-full">
										<input
											type="hidden"
											name="tryAnotherWay"
											value="on"
										/>
										<Button
											className="w-full"
											onClick={onClickTryAnotherWay}>
											{msg("doTryAnotherWay")}
										</Button>
									</div>
								</div>
							</form>
						)}
						{ssoProviders.length > 0 && (
							<div className="w-full">
								<div
									className={
										ssoProviders.length < 3
											? "flex gap-4"
											: "grid grid-flow-row md:grid-cols-3 w-full gap-4"
									}>
									{ssoProviders.map(ssoProvider => {
										const provider =
											ssoProvider.id as keyof typeof SSO_PROVIDERS_LABELS;
										const Logo =
											SSO_PROVIDERS_ICONS[provider];

										return (
											<Button
												key={ssoProvider.id}
												asChild
												variant={
													theme === "light"
														? "default"
														: "outline"
												}
												className="px-5 py-6 w-full">
												<a
													className="flex gap-2 items-center"
													href={ssoProvider.href}>
													<Logo className="w-5 h-auto text-foreground" />

													{
														SSO_PROVIDERS_LABELS[
															provider
														]
													}
												</a>
											</Button>
										);
									})}
								</div>
							</div>
						)}
						{displayInfo && infoNode}
					</CardFooter>
				</Card>
			</div>
		</div>
	);
};
