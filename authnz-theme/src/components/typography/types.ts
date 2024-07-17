import React from "react";

export type TypographyProps<T extends keyof React.JSX.IntrinsicElements> =
	React.ComponentPropsWithRef<T>;
