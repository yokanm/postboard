import type * as React from "react";
import { cn } from "#/lib/utils.ts";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
	return (
		<textarea
			data-slot="textarea"
			className={cn(
				"flex min-h-[80px] w-full border border-(--rule) bg-(--background) px-3 py-2 text-[13px] text-(--on-surface) transition-[color,box-shadow] outline-none",
				"placeholder:text-(--muted)",
				"focus-visible:border-(--primary-container) focus-visible:ring-[3px] focus-visible:ring-(--primary-container)",
				"aria-invalid:border-(--destructive) aria-invalid:ring-(--destructive)/20",
				"disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}

export { Textarea };
