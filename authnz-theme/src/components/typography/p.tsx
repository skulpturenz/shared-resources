import React from "react";
import type { TypographyProps } from "./types";
import { cn } from "@/lib/utils";

export const P = React.forwardRef<React.ElementRef<"p">, TypographyProps>(
	({ className, ...props }, ref) => (
		<p
			ref={ref}
			className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}
			{...props}
		/>
	),
);
