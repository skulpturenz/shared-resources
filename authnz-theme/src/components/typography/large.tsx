import React from "react";
import type { TypographyProps } from "./types";
import { cn } from "@/lib/utils";

export const Large = React.forwardRef<React.ElementRef<"div">, TypographyProps>(
	({ className, ...props }, ref) => (
		<div
			ref={ref}
			className={cn("text-lg font-semibold", className)}
			{...props}
		/>
	),
);
