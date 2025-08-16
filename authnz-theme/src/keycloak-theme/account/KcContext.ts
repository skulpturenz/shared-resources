import type { ExtendKcContext } from "keycloakify/account";
import type { KcEnvName, ThemeName } from "../kc.gen";

export type KcContextExtension = {
	themeName: ThemeName;
	properties: Record<KcEnvName, string> & {};
};

/* eslint-disable @typescript-eslint/no-empty-object-type */
export type KcContextExtensionPerPage = {};

export type KcContext = ExtendKcContext<
	KcContextExtension,
	KcContextExtensionPerPage
>;
