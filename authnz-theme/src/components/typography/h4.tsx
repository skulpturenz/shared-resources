import React from "react";
import type { TypographyProps } from "./types";
import { cn } from "@/lib/utils";

export const H4 = React.forwardRef<
	React.ElementRef<"h4">,
	TypographyProps<"h4">
>(({ className, ...props }, ref) => (
	<h4
		ref={ref}
		className={cn(
			"scroll-m-20 text-xl font-semibold tracking-tight",
			className,
		)}
		{...props}
	/>
));