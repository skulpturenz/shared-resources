import React from "react";
import type { TypographyProps } from "./types";
import { cn } from "@/lib/utils";

export const Ul = React.forwardRef<React.ElementRef<"ul">, TypographyProps>(
	({ className, ...props }, ref) => (
		<ul
			ref={ref}
			className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)}
			{...props}
		/>
	),
);
