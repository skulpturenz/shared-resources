import React from "react";
import { cn } from "@/lib/utils";
import type { TypographyProps } from "./types";

export const H2 = React.forwardRef<React.ElementRef<"h2">, TypographyProps>(
	({ className, ...props }, ref) => (
		<h2
			ref={ref}
			className={cn(
				"scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
				className,
			)}
			{...props}
		/>
	),
);
