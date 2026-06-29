import type * as React from "react";
import { cn } from "#/lib/utils.ts";

function Card({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card"
			className={cn(
				"border border-(--rule) bg-(--surface-container-lowest)",
				className,
			)}
			{...props}
		/>
	);
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-header"
			className={cn(
				"flex flex-col gap-1.5 border-b border-(--rule) px-6 py-4",
				className,
			)}
			{...props}
		/>
	);
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
	return (
		<h3
			data-slot="card-title"
			className={cn(
				"font-(--font-sans) text-[15px] font-semibold text-(--on-surface)",
				className,
			)}
			{...props}
		/>
	);
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
	return (
		<p
			data-slot="card-description"
			className={cn("font-(--font-sans) text-[13px] text-(--body)", className)}
			{...props}
		/>
	);
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-content"
			className={cn("px-6 py-4", className)}
			{...props}
		/>
	);
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-footer"
			className={cn(
				"flex items-center border-t border-(--rule) px-6 py-4",
				className,
			)}
			{...props}
		/>
	);
}

export {
	Card,
	CardHeader,
	CardFooter,
	CardTitle,
	CardDescription,
	CardContent,
};
