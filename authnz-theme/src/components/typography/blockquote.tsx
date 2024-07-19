import React from "react";
import type { TypographyProps } from "./types";
import { cn } from "@/lib/utils";

export const Blockquote = React.forwardRef<
	React.ElementRef<"blockquote">,
	TypographyProps<"blockquote">
>(({ className, ...props }, ref) => (
	<blockquote
		ref={ref}
		className={cn("mt-6 border-l-2 pl-6 italic", className)}
		{...props}
	/>
));
