import type * as React from "react";
import { cn } from "#/lib/utils.ts";

function Avatar({ className, ...props }: React.ComponentProps<"span">) {
	return (
		<span
			data-slot="avatar"
			className={cn(
				"relative flex size-8 shrink-0 overflow-hidden border border-(--rule)",
				className,
			)}
			{...props}
		/>
	);
}

function AvatarImage({ className, ...props }: React.ComponentProps<"img">) {
	return (
		<img
			data-slot="avatar-image"
			className={cn("aspect-square size-full object-cover", className)}
			{...props}
		/>
	);
}

function AvatarFallback({ className, ...props }: React.ComponentProps<"span">) {
	return (
		<span
			data-slot="avatar-fallback"
			className={cn(
				"flex size-full items-center justify-center bg-(--surface-container) font-sans text-[12px] font-medium text-(--dim) uppercase",
				className,
			)}
			{...props}
		/>
	);
}

export { Avatar, AvatarImage, AvatarFallback };
