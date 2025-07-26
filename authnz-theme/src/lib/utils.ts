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
		return ((node as React.ReactElement)?.props as any)?.children ?? [];
	}

	if (
		!node ||
		typeof node !== "object" ||
		!((node as React.ReactElement).props as any).children ||
		typeof ((node as React.ReactElement)?.props as any)?.children !== "object"
	) {
		return [node];
	}

	const element = node as React.ReactElement;

	if (!Array.isArray((element.props as any).children)) {
		return flattenChildren(
			(element.props as any).children,
			maxDepth,
			currentDepth + 1,
		);
	}

	return ((element.props as any).children as React.ReactNode[])
		.flatMap(child => flattenChildren(child, maxDepth, currentDepth + 1))
		.filter(Boolean);
};

export const toPlainText = (rawHtml: string) => {
	const tempNode = document.createElement("div");

	tempNode.innerHTML = rawHtml;

	const text = tempNode.textContent || tempNode.innerText || "";

	tempNode.remove();

	return text.replace(/\.(?=\w+\s)/gi, ". ");
};
