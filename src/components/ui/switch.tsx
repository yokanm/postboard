import type * as React from "react";
import { cn } from "#/lib/utils.ts";

function Switch({ className, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			type="checkbox"
			role="switch"
			data-slot="switch"
			className={cn(
				"peer relative inline-flex h-5 w-9 shrink-0 cursor-pointer appearance-none border border-(--rule) bg-(--surface-container) transition-colors",
				"checked:bg-(--primary-container) checked:border-(--primary-container)",
				"before:absolute before:left-0.5 before:top-0.5 before:h-3.5 before:w-3.5 before:bg-(--dim) before:transition-all",
				"checked:before:translate-x-4 checked:before:bg-(--on-primary-container)",
				"focus-visible:ring-[3px] focus-visible:ring-(--primary-container)",
				"disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}

export { Switch };
