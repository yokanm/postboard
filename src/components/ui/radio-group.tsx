import type * as React from "react";
import { cn } from "#/lib/utils.ts";

function RadioGroup({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="radio-group"
			role="radiogroup"
			className={cn("flex flex-col gap-2", className)}
			{...props}
		/>
	);
}

function RadioGroupItem({
	className,
	...props
}: React.ComponentProps<"input">) {
	return (
		<input
			type="radio"
			data-slot="radio-group-item"
			className={cn(
				"peer size-4 shrink-0 appearance-none rounded-full border border-(--rule) bg-(--surface-container)",
				"checked:border-(--primary-container) checked:bg-(--primary-container) checked:shadow-[inset_0_0_0_2px] checked:shadow-(--background)",
				"focus-visible:ring-[3px] focus-visible:ring-(--primary-container)",
				"disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}

export { RadioGroup, RadioGroupItem };
