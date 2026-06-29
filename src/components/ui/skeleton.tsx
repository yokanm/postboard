import { cn } from "#/lib/utils.ts";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="skeleton"
			className={cn("animate-pulse bg-(--surface-container-high)", className)}
			{...props}
		/>
	);
}

export { Skeleton };
