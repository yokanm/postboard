import type * as React from "react";
import { cn } from "#/lib/utils.ts";

const TooltipProvider = ({
	children,
	delayDuration: _delayDuration = 300,
}: {
	children: React.ReactNode;
	delayDuration?: number;
}) => (
	<span data-slot="tooltip-provider" className="contents">
		{children}
	</span>
);

const Tooltip = ({
	children,
}: {
	children: React.ReactNode;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
}) => (
	<span data-slot="tooltip" className="contents">
		{children}
	</span>
);

const TooltipTrigger = ({
	children,
}: {
	children: React.ReactNode;
	asChild?: boolean;
}) => (
	<span data-slot="tooltip-trigger" className="contents">
		{children}
	</span>
);

function TooltipContent({
	className,
	children,
	...props
}: React.ComponentProps<"div"> & {
	side?: "top" | "bottom" | "left" | "right";
}) {
	return (
		<div
			data-slot="tooltip-content"
			className={cn(
				"z-50 max-w-[280px] border border-(--rule) bg-(--surface-container-lowest) px-3 py-1.5 font-sans text-[12px] text-(--on-surface) shadow-sm",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
