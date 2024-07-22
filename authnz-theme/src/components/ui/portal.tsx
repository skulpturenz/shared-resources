import type React from "react";
import ReactDOM from "react-dom";

export interface PortalProps {
	children?: React.ReactNode;
	container?: HTMLElement;
}

export const Portal = ({ children, container }: PortalProps) =>
	ReactDOM.createPortal(
		children,
		container ?? (document.querySelector("body") as HTMLElement),
	);
