import React from "react";
import type { TypographyProps } from "./types";
import { cn } from "@/lib/utils";

export const H1 = React.forwardRef<
	React.ElementRef<"h1">,
	TypographyProps<"h1">
>(({ className, ...props }, ref) => (
	<h1
		ref={ref}
		className={cn(
			"scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
			className,
		)}
		{...props}
	/>
));
