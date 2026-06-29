import {
	ArrowDown01Icon,
	ArrowUp01Icon,
	ArrowUpDownIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/shared/components/ux/EmptyState";
import { ErrorState } from "@/shared/components/ux/ErrorState";

export interface Column<T> {
	key: string;
	header: string;
	render: (item: T) => ReactNode;
	sortable?: boolean;
	className?: string;
	hideOnMobile?: boolean;
}

interface DataTableProps<T> {
	columns: Column<T>[];
	data: T[];
	keyExtractor: (item: T) => string;
	isLoading?: boolean;
	isError?: boolean;
	errorMessage?: string;
	onRetry?: () => void;
	emptyTitle?: string;
	emptyDescription?: string;
	emptyAction?: { label: string; onClick: () => void };
	sortKey?: string;
	sortDir?: "asc" | "desc";
	onSort?: (key: string) => void;
	rowClassName?: string;
}

export function DataTable<T>({
	columns,
	data,
	keyExtractor,
	isLoading,
	isError,
	errorMessage,
	onRetry,
	emptyTitle,
	emptyDescription,
	emptyAction,
	sortKey,
	sortDir,
	onSort,
	rowClassName,
}: DataTableProps<T>) {
	if (isLoading) {
		return (
			<div className="flex flex-col gap-1">
				{Array.from({ length: 5 }).map((_, i) => (
					<Skeleton key={i} className="h-10 w-full" />
				))}
			</div>
		);
	}

	if (isError) {
		return (
			<ErrorState
				message={errorMessage ?? "Failed to load data"}
				onRetry={onRetry}
			/>
		);
	}

	if (data.length === 0) {
		return (
			<EmptyState
				title={emptyTitle ?? "No data"}
				description={emptyDescription}
				action={emptyAction}
			/>
		);
	}

	return (
		<div className="overflow-x-auto border border-(--rule)">
			<table className="w-full border-collapse">
				<thead>
					<tr className="border-b border-(--rule) bg-(--surface-container-low)">
						{columns.map((col) => (
							<th
								key={col.key}
								className={`mono-label px-4 py-3 text-left text-[11px] uppercase tracking-[0.05em] text-(--dim) ${col.sortable ? "cursor-pointer select-none hover:text-(--on-surface)" : ""} ${col.hideOnMobile ? "hidden sm:table-cell" : ""} ${col.className ?? ""}`}
								onClick={col.sortable ? () => onSort?.(col.key) : undefined}
								aria-sort={
									sortKey === col.key
										? sortDir === "asc"
											? "ascending"
											: "descending"
										: undefined
								}
								scope="col"
							>
								<div className="flex items-center gap-1.5">
									<span>{col.header}</span>
									{col.sortable && (
										<span className="inline-flex flex-col" aria-hidden="true">
											{sortKey === col.key ? (
												sortDir === "asc" ? (
													<HugeiconsIcon
														icon={ArrowUp01Icon}
														strokeWidth={2}
														className="h-3 w-3"
													/>
												) : (
													<HugeiconsIcon
														icon={ArrowDown01Icon}
														strokeWidth={2}
														className="h-3 w-3"
													/>
												)
											) : (
												<HugeiconsIcon
													icon={ArrowUpDownIcon}
													strokeWidth={2}
													className="h-3 w-3 text-(--muted)"
												/>
											)}
										</span>
									)}
								</div>
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{data.map((item) => (
						<tr
							key={keyExtractor(item)}
							className={`border-b border-(--rule) transition-colors hover:bg-(--surface-container-low) ${rowClassName ?? ""}`}
						>
							{columns.map((col) => (
								<td
									key={col.key}
									className={`px-4 py-3 font-sans text-[13px] text-(--on-surface) ${col.hideOnMobile ? "hidden sm:table-cell" : ""} ${col.className ?? ""}`}
								>
									{col.render(item)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
