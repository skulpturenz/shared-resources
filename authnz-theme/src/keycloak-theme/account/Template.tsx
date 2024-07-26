import React from "react";
import { assert } from "keycloakify/tools/assert";
import { clsx } from "keycloakify/tools/clsx";
import { getKcClsx } from "keycloakify/account/lib/kcClsx";
import { useInsertLinkTags } from "keycloakify/tools/useInsertLinkTags";
import { useSetClassName } from "keycloakify/tools/useSetClassName";
import type { TemplateProps } from "keycloakify/account/TemplateProps";
import type { I18n } from "./i18n";
import type { KcContext } from "./KcContext";
import { LogoLight, LogoDark } from "@/components/assets";
import { Sun, MoonStar, LogOut, UndoDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	ThemeProvider,
	useTheme,
	type Theme,
} from "@/components/ui/theme-provider";
import { Combobox } from "@/components/ui/combobox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
} from "@/components/ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";

export const Template = (props: TemplateProps<KcContext, I18n>) => (
	<ThemeProvider defaultTheme="dark" storageKey="ui-theme">
		<TemplateWithoutTheme {...props} />
	</ThemeProvider>
);

const TemplateWithoutTheme = (props: TemplateProps<KcContext, I18n>) => {
	const { kcContext, i18n, doUseDefaultCss, active, classes, children } =
		props;

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

	const { locale, url, features, realm, message, referrer } = kcContext;

	const [buttonWidth, setButtonWidth] = React.useState(0);

	React.useEffect(() => {
		document.title = msgStr("accountManagementTitle");
	}, []);

	useSetClassName({
		qualifiedName: "html",
		className: kcClsx("kcHtmlClass"),
	});

	useSetClassName({
		qualifiedName: "body",
		className: clsx("admin-console", "user", kcClsx("kcBodyClass")),
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
					`${url.resourcesCommonPath}/node_modules/patternfly/dist/css/patternfly.min.css`,
					`${url.resourcesCommonPath}/node_modules/patternfly/dist/css/patternfly-additions.min.css`,
					`${url.resourcesPath}/css/account.css`,
				],
	});

	if (!areAllStyleSheetsLoaded) {
		return null;
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

	const nextTheme = () => {
		const validThemes: Theme[] = ["light", "dark"];

		const currentThemeIdx = validThemes.findIndex(
			validTheme => validTheme === theme,
		);

		if (!~currentThemeIdx) {
			return theme;
		}

		const nextThemeIdx = currentThemeIdx ^ 1;
		const nextTheme = validThemes.at(nextThemeIdx) as Theme;

		return nextTheme;
	};
	const onClickToggleTheme = () => {
		setTheme(nextTheme());
	};
	const onMountMobileLogo = (instance: HTMLButtonElement | null) => {
		if (!instance) {
			return;
		}

		setButtonWidth(instance.offsetWidth);
	};

	const sidebarItems = [
		{
			id: "account",
			href: url.accountUrl,
			label: msgStr("account"),
		},
		{
			id: "password",
			href: url.passwordUrl,
			label: msgStr("password"),
			isHidden: !features.passwordUpdateSupported,
		},
		{
			id: "totp",
			href: url.totpUrl,
			label: msgStr("authenticator"),
		},
		{
			id: "social",
			href: url.socialUrl,
			label: msgStr("federatedIdentity"),
			isHidden: !features.identityFederation,
		},
		{
			id: "sessions",
			href: url.sessionsUrl,
			label: msgStr("sessions"),
		},
		{
			id: "applications",
			href: url.applicationsUrl,
			label: msgStr("applications"),
		},
		{
			id: "log",
			href: url.logUrl,
			label: msgStr("log"),
			isHidden: !features.log,
		},
		{
			id: "authorization",
			href: url.resourceUrl,
			label: msgStr("myResources"),
			isHidden:
				!realm.userManagedAccessAllowed || !features.authorization,
		},
	];

	return (
		<>
			<header>
				<nav className="bg-background w-screen bottom-0 border-t-2 md:static fixed md:border-b md:border-t-0">
					<div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
						<div className="hidden md:flex md:h-24 md:items-center md:justify-between">
							{/* TODO: remove */}
							<div></div>

							<div className="flex gap-2">
								{localizationOptions.length > 0 && (
									<div className="w-48">
										<Combobox
											className="w-full md:max-w-md"
											options={localizationOptions}
											initialValue={
												currentLocalizationOption
											}
											selectPlaceholder={msgStr(
												"selectLanguage",
											)}
											searchPlaceholder={msgStr(
												"searchLanguage",
											)}
											noResultsText={msgStr(
												"noLanguages",
											)}
										/>
									</div>
								)}

								<div>
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant="outline"
													size="icon"
													onClick={
														onClickToggleTheme
													}>
													<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
													<MoonStar className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-primary" />
													<span className="sr-only">
														{msg("toggleTheme")}
													</span>
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<span>
													{msg("toggleTheme")}
												</span>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</div>

								{referrer?.url && (
									<div>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														variant="outline"
														size="icon"
														asChild>
														<a
															href={referrer?.url}
															id="referrer">
															<UndoDot className="h-[1.2rem] w-[1.2rem]" />
															<span className="sr-only">
																{msg(
																	"backTo",
																	referrer?.name,
																)}
															</span>
														</a>
													</Button>
												</TooltipTrigger>
												<TooltipContent>
													<span>
														{msg(
															"backTo",
															referrer?.name,
														)}
													</span>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</div>
								)}

								<div>
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant="destructive"
													size="icon"
													asChild>
													<a
														href={url.getLogoutUrl()}>
														<LogOut className="h-[1.2rem] w-[1.2rem]" />
														<span className="sr-only">
															{msg("doSignOut")}
														</span>
													</a>
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<span>{msg("doSignOut")}</span>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</div>
							</div>
						</div>

						<div className="md:hidden h-24 flex items-center justify-center">
							<div>
								<DropdownMenu>
									<DropdownMenuTrigger
										className="h-full"
										asChild>
										<Button
											ref={onMountMobileLogo}
											variant="ghost">
											<Logo className="h-10 w-auto" />
										</Button>
									</DropdownMenuTrigger>

									<DropdownMenuContent
										style={{ width: buttonWidth }}
										className="px-2">
										{realm.internationalizationEnabled &&
											localizationOptions.length > 0 && (
												<DropdownMenuItem asChild>
													<Combobox
														className="w-full md:max-w-xs"
														options={
															localizationOptions
														}
														initialValue={
															currentLocalizationOption
														}
														selectPlaceholder={msgStr(
															"selectLanguage",
														)}
														searchPlaceholder={msgStr(
															"searchLanguage",
														)}
														noResultsText={msgStr(
															"noLanguages",
														)}
													/>
												</DropdownMenuItem>
											)}

										<DropdownMenuItem asChild>
											<Button
												variant="ghost"
												className="w-full"
												onClick={onClickToggleTheme}>
												<div className="w-full flex gap-2 self-start cursor-pointer">
													<div className="relative">
														<Sun className="absolute h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
														<MoonStar className="rotate-90 h-[1.2rem] w-[1.2rem] scale-0 transition-all dark:rotate-0 dark:scale-100 text-primary" />
													</div>
													<span>
														{msg("toggleTheme")}
													</span>
												</div>
											</Button>
										</DropdownMenuItem>

										{referrer?.url && (
											<DropdownMenuItem asChild>
												<Button
													variant="ghost"
													className="w-full justify-start"
													asChild>
													<a
														href={referrer?.url}
														id="referrer"
														className="flex gap-2 w-full self-start">
														<UndoDot className="h-[1.2rem] w-[1.2rem]" />
														{msg(
															"backTo",
															referrer?.name,
														)}
													</a>
												</Button>
											</DropdownMenuItem>
										)}

										<DropdownMenuItem asChild>
											<Button
												variant="ghost"
												className="w-full justify-start"
												asChild>
												<a
													href={url.getLogoutUrl()}
													className="flex gap-2 w-full self-start">
													<LogOut className="h-[1.2rem] w-[1.2rem]" />
													{msg("doSignOut")}
												</a>
											</Button>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</div>
					</div>
				</nav>
			</header>

			<div className="hidden md:fixed md:inset-y-0 md:z-50 md:flex md:w-72 md:flex-col">
				<div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-background px-12 pb-4">
					<div className="flex h-24 items-center">
						<Logo className="h-8 w-auto" />
					</div>

					{sidebarItems
						.filter(item => !item.isHidden)
						.map(item => (
							<Button
								variant="ghost"
								className="flex justify-start w-full"
								asChild>
								<a href={item.href}>{item.label}</a>
							</Button>
						))}
				</div>
			</div>
			<div className="hidden container">
				<div className="bs-sidebar col-sm-3">
					<ul>
						<li className={clsx(active === "account" && "active")}>
							<a href={url.accountUrl}>{msg("account")}</a>
						</li>
						{features.passwordUpdateSupported && (
							<li
								className={clsx(
									active === "password" && "active",
								)}>
								<a href={url.passwordUrl}>{msg("password")}</a>
							</li>
						)}
						<li className={clsx(active === "totp" && "active")}>
							<a href={url.totpUrl}>{msg("authenticator")}</a>
						</li>
						{features.identityFederation && (
							<li
								className={clsx(
									active === "social" && "active",
								)}>
								<a href={url.socialUrl}>
									{msg("federatedIdentity")}
								</a>
							</li>
						)}
						<li className={clsx(active === "sessions" && "active")}>
							<a href={url.sessionsUrl}>{msg("sessions")}</a>
						</li>
						<li
							className={clsx(
								active === "applications" && "active",
							)}>
							<a href={url.applicationsUrl}>
								{msg("applications")}
							</a>
						</li>
						{features.log && (
							<li className={clsx(active === "log" && "active")}>
								<a href={url.logUrl}>{msg("log")}</a>
							</li>
						)}
						{realm.userManagedAccessAllowed &&
							features.authorization && (
								<li
									className={clsx(
										active === "authorization" && "active",
									)}>
									<a href={url.resourceUrl}>
										{msg("myResources")}
									</a>
								</li>
							)}
					</ul>
				</div>

				<div className="col-sm-9 content-area">
					{message !== undefined && (
						<div className={clsx("alert", `alert-${message.type}`)}>
							{message.type === "success" && (
								<span className="pficon pficon-ok"></span>
							)}
							{message.type === "error" && (
								<span className="pficon pficon-error-circle-o"></span>
							)}
							<span
								className="kc-feedback-text"
								dangerouslySetInnerHTML={{
									__html: message.summary,
								}}
							/>
						</div>
					)}

					{children}
				</div>
			</div>
		</>
	);
};
