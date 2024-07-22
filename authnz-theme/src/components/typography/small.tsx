import React from "react";
import type { TypographyProps } from "./types";
import { cn } from "@/lib/utils";

export const Small = React.forwardRef<
	React.ElementRef<"small">,
	TypographyProps<"small">
>(({ className, ...props }, ref) => (
	<small
		ref={ref}
		className={cn("text-sm font-medium leading-none", className)}
		{...props}
	/>
));
