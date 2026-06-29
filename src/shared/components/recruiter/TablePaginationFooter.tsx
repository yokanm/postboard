interface TablePaginationFooterProps {
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	onNext: () => void;
	onPrevious: () => void;
	isFetchingNextPage?: boolean;
}

export function TablePaginationFooter({
	hasNextPage,
	hasPreviousPage,
	onNext,
	onPrevious,
	isFetchingNextPage,
}: TablePaginationFooterProps) {
	if (!hasNextPage && !hasPreviousPage) return null;
	return (
		<div className="flex items-center justify-between border-t border-(--rule) px-4 py-3">
			<span className="mono-label text-[11px] text-(--dim)">
				{hasPreviousPage ? "Use navigation to browse pages" : ""}
			</span>
			<div className="flex gap-2">
				<button
					type="button"
					onClick={onPrevious}
					disabled={!hasPreviousPage}
					className="mono-label cursor-pointer border border-(--rule) bg-(--surface-container-low) px-3 py-1.5 text-[11px] uppercase tracking-[0.05em] text-(--dim) transition-colors hover:border-(--on-surface) hover:text-(--on-surface) disabled:opacity-30 disabled:cursor-not-allowed"
				>
					Previous
				</button>
				<button
					type="button"
					onClick={onNext}
					disabled={!hasNextPage || isFetchingNextPage}
					className="mono-label cursor-pointer border border-(--rule) bg-(--surface-container-low) px-3 py-1.5 text-[11px] uppercase tracking-[0.05em] text-(--dim) transition-colors hover:border-(--on-surface) hover:text-(--on-surface) disabled:opacity-30 disabled:cursor-not-allowed"
				>
					{isFetchingNextPage ? "Loading..." : "Next"}
				</button>
			</div>
		</div>
	);
}
