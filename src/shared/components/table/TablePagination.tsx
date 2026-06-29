import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface TablePaginationProps {
	hasNextPage: boolean;
	hasPrevPage: boolean;
	onNext: () => void;
	onPrev: () => void;
	isLoading?: boolean;
}

export function TablePagination({
	hasNextPage,
	hasPrevPage,
	onNext,
	onPrev,
	isLoading,
}: TablePaginationProps) {
	return (
		<div className="flex items-center justify-end gap-2 border-x border-b border-(--rule) px-4 py-3">
			<button
				type="button"
				onClick={onPrev}
				disabled={!hasPrevPage || isLoading}
				className="flex items-center gap-1 border border-(--rule) px-3 py-1.5 font-sans text-[12px] text-(--on-surface) transition-colors hover:bg-(--surface-container-low) disabled:opacity-50"
				aria-label="Previous page"
			>
				<HugeiconsIcon
					icon={ArrowLeft01Icon}
					strokeWidth={2}
					className="h-3.5 w-3.5"
					aria-hidden="true"
				/>
				<span className="hidden sm:inline">Previous</span>
			</button>
			<button
				type="button"
				onClick={onNext}
				disabled={!hasNextPage || isLoading}
				className="flex items-center gap-1 border border-(--rule) px-3 py-1.5 font-sans text-[12px] text-(--on-surface) transition-colors hover:bg-(--surface-container-low) disabled:opacity-50"
				aria-label="Next page"
			>
				<span className="hidden sm:inline">Next</span>
				<HugeiconsIcon
					icon={ArrowRight01Icon}
					strokeWidth={2}
					className="h-3.5 w-3.5"
					aria-hidden="true"
				/>
			</button>
		</div>
	);
}
