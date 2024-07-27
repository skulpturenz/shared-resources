import React from "react";
import { assert } from "keycloakify/tools/assert";
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
	Check,
} from "lucide-react";
import { LogoLight, LogoDark } from "@/components/assets";
import { Label } from "@/components/ui/label";
import { cn, toPlainText } from "@/lib/utils";

export const Template = (props: TemplateProps<KcContext, I18n>) => (
	<ThemeProvider
		defaultTheme="dark"
		storageKey={`skulpture-iam-theme-${import.meta.env.MODE}`}>
		<TemplateWithoutTheme {...props} />
	</ThemeProvider>
);

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

	React.useEffect(() => {
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

	React.useEffect(() => {
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

	React.useEffect(() => {
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
					<div className="flex items-center gap-2">
						<RotateCcw className="h-4 w-4" />
						<span>{msg("restartLoginTooltip")}</span>
					</div>
				</a>
			</div>
		);
	};

	const onClickTryAnotherWay = () => {
		document.forms["kc-select-try-another-way-form" as never].submit();

		return false;
	};

	return (
		<div className="my-20 mx-8 md:mx-0 flex flex-col items-center justify-center">
			<div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 m-4 md:mb-12">
				<Logo className="h-14 md:mt-3 w-auto" />
				<span className="hidden md:block font-light text-2xl md:text-6xl ">
					/
				</span>
				<span className="uppercase md:lowercase font-semibold md:font-bold text-2xl md:text-6xl">
					{realm.displayName}
				</span>
			</div>

			<div className="w-full max-w-3xl">
				<Card>
					<CardHeader className="flex flex-col gap-2">
						<div
							className={cn(
								"flex gap-2",
								realm.internationalizationEnabled &&
									localizationOptions.length > 0
									? "md:justify-end"
									: "justify-end",
							)}>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" size="icon">
										<Sun className="h-5 w-auto aspect-square rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
										<MoonStar className="absolute h-5 w-auto aspect-square rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-primary" />
										<span className="sr-only">
											{msg("toggleTheme")}
										</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem
										onClick={onClickLightTheme}>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												theme === "light"
													? "opacity-100"
													: "opacity-0",
											)}
										/>
										{msg("lightTheme")}
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={onClickDarkTheme}>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												theme === "dark"
													? "opacity-100"
													: "opacity-0",
											)}
										/>
										{msg("darkTheme")}
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={onClickSystemTheme}>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												theme === "system"
													? "opacity-100"
													: "opacity-0",
											)}
										/>
										{msg("systemTheme")}
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
							{realm.internationalizationEnabled &&
								localizationOptions.length > 0 && (
									<Combobox
										className="w-full md:max-w-xs"
										options={localizationOptions}
										initialValue={currentLocalizationOption}
										selectPlaceholder={msgStr(
											"selectLanguage",
										)}
										searchPlaceholder={msgStr(
											"searchLanguage",
										)}
										noResultsText={msgStr("noLanguages")}
									/>
								)}
						</div>

						<CardTitle className="flex flex-col gap-2">
							{!displayRequiredFields && <PageHeader />}

							{displayRequiredFields && (
								<div>
									<div className="subtitle">
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
									<CardDescription className="flex gap-2 items-center">
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
						{socialProvidersNode}
						{displayInfo && infoNode}
					</CardFooter>
				</Card>
			</div>
		</div>
	);
};
