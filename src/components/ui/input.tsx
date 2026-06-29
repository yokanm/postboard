import type * as React from "react";

import { cn } from "#/lib/utils.ts";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				"h-9 w-full min-w-0 border border-(--rule) bg-(--background) px-3 py-1 text-[13px] text-(--on-surface) transition-[color,box-shadow] outline-none selection:bg-(--primary-container) selection:text-(--on-primary-container) file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-(--muted) disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
				"focus-visible:border-(--primary-container) focus-visible:ring-[3px] focus-visible:ring-(--primary-container)",
				"aria-invalid:border-(--destructive) aria-invalid:ring-(--destructive)/20",
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
