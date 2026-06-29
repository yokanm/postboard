import type * as React from "react";
import { cn } from "#/lib/utils.ts";

function Checkbox({ className, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			type="checkbox"
			data-slot="checkbox"
			className={cn(
				"peer size-4 shrink-0 appearance-none border border-(--rule) bg-(--surface-container) checked:bg-(--primary-container) checked:border-(--primary-container)",
				"focus-visible:ring-[3px] focus-visible:ring-(--primary-container)",
				"disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}

export { Checkbox };
