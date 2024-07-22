import React from "react";
import type { TypographyProps } from "./types";
import { cn } from "@/lib/utils";

export const H3 = React.forwardRef<
	React.ElementRef<"h3">,
	TypographyProps<"h3">
>(({ className, ...props }, ref) => (
	<h3
		ref={ref}
		className={cn(
			"scroll-m-20 text-2xl font-semibold tracking-tight",
			className,
		)}
		{...props}
	/>
));
