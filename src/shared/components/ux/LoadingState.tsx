import { Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingStateProps {
	message?: string;
	variant?: "spinner" | "skeleton" | "page";
	count?: number;
}

export function LoadingState({
	message,
	variant = "spinner",
	count = 3,
}: LoadingStateProps) {
	if (variant === "page") {
		return (
			<div
				className="flex min-h-[60vh] flex-col items-center justify-center gap-4"
				role="status"
			>
				<HugeiconsIcon
					icon={Loading03Icon}
					strokeWidth={2}
					className="h-8 w-8 animate-spin text-(--primary-container)"
					aria-hidden="true"
				/>
				{message && (
					<p className="font-sans text-[13px] text-(--dim)">{message}</p>
				)}
				<span className="sr-only">Loading page content</span>
			</div>
		);
	}

	if (variant === "skeleton") {
		return (
			<div
				className="flex flex-col gap-3"
				role="status"
				aria-busy="true"
				aria-label={message ?? "Loading content"}
			>
				{Array.from({ length: count }).map((_, i) => (
					<Skeleton key={i} className="h-12 w-full" />
				))}
				<span className="sr-only">{message ?? "Loading content"}</span>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-2" role="status">
			<HugeiconsIcon
				icon={Loading03Icon}
				strokeWidth={2}
				className="h-4 w-4 animate-spin text-(--primary-container)"
				aria-hidden="true"
			/>
			{message && (
				<span className="font-sans text-[13px] text-(--dim)">{message}</span>
			)}
			<span className="sr-only">Loading</span>
		</div>
	);
}
