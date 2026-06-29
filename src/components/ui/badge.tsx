import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "#/lib/utils.ts";

const badgeVariants = cva(
	"inline-flex items-center gap-1.5 px-2 py-0.5 font-(--font-mono) text-[11px] font-medium uppercase tracking-[0.05em]",
	{
		variants: {
			variant: {
				default: "border border-(--rule) text-(--on-surface)",
				primary: "bg-(--primary-container) text-(--on-primary-container)",
				success: "bg-(--live-dim) text-(--live) border border-(--live)/30",
				destructive:
					"bg-(--error-container) text-(--destructive) border border-(--destructive)/30",
				outline: "border border-(--rule) text-(--dim)",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

function Badge({
	className,
	variant,
	...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
	return (
		<span
			data-slot="badge"
			className={cn(badgeVariants({ variant }), className)}
			{...props}
		/>
	);
}

export { Badge, badgeVariants };
