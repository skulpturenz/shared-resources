import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
	return twMerge(clsx(inputs));
};

export const flattenChildren = (
	node: React.ReactNode,
	maxDepth = Infinity,
	currentDepth = 0,
): React.ReactNode[] => {
	if (currentDepth >= maxDepth) {
		return (node as React.ReactElement)?.props?.children ?? [];
	}

	if (
		!node ||
		typeof node !== "object" ||
		!(node as React.ReactElement).props.children ||
		typeof (node as React.ReactElement)?.props?.children !== "object"
	) {
		return [node];
	}

	const element = node as React.ReactElement;

	if (!Array.isArray(element.props.children)) {
		return flattenChildren(
			element.props.children,
			maxDepth,
			currentDepth + 1,
		);
	}

	return (element.props.children as React.ReactNode[])
		.flatMap(child => flattenChildren(child, maxDepth, currentDepth + 1))
		.filter(Boolean);
};
