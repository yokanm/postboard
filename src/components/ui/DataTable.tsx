import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { type ReactNode, useState } from "react";

interface CursorPagination {
	currentPage: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
	onNext: () => void;
	onPrev: () => void;
}

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	searchColumn?: string;
	searchPlaceholder?: string;
	toolbar?: ReactNode;
	pageSize?: number;
	cursorPagination?: CursorPagination;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	searchColumn,
	searchPlaceholder = "Search...",
	toolbar,
	pageSize = 10,
	cursorPagination,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [globalFilter, setGlobalFilter] = useState("");

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		...(cursorPagination
			? {}
			: { getPaginationRowModel: getPaginationRowModel() }),
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onGlobalFilterChange: setGlobalFilter,
		state: { sorting, columnFilters, globalFilter },
		initialState: cursorPagination ? undefined : { pagination: { pageSize } },
	});

	return (
		<div className="flex flex-col gap-4">
			{(searchColumn || toolbar) && (
				<div className="flex items-center justify-between gap-4">
					{searchColumn && (
						<input
							placeholder={searchPlaceholder}
							value={
								(table.getColumn(searchColumn)?.getFilterValue() as string) ??
								""
							}
							onChange={(e) =>
								table.getColumn(searchColumn)?.setFilterValue(e.target.value)
							}
							className="border border-(--rule) bg-(--surface-container-low) px-3 py-2 font-sans text-[13px] text-(--on-surface) outline-none placeholder:text-(--dim) focus:border-(--primary) w-full max-w-xs"
						/>
					)}
					{toolbar}
				</div>
			)}

			<div className="overflow-x-auto border border-(--rule)">
				<table className="w-full border-collapse">
					<thead>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id} className="border-b border-(--rule)">
								{headerGroup.headers.map((header) => (
									<th
										key={header.id}
										className="px-3 py-2 text-left font-sans text-[11px] font-semibold uppercase tracking-[0.05em] text-(--dim) cursor-pointer select-none hover:text-(--on-surface)"
										onClick={header.column.getToggleSortingHandler()}
									>
										<div className="flex items-center gap-1">
											{flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
											{{
												asc: " ▲",
												desc: " ▼",
											}[header.column.getIsSorted() as string] ?? null}
										</div>
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody>
						{table.getRowModel().rows.length ? (
							table.getRowModel().rows.map((row) => (
								<tr
									key={row.id}
									className="border-b border-(--rule) last:border-b-0 hover:bg-(--surface-container)"
								>
									{row.getVisibleCells().map((cell) => (
										<td
											key={cell.id}
											className="px-3 py-2 font-sans text-[13px] text-(--on-surface)"
										>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</td>
									))}
								</tr>
							))
						) : (
							<tr>
								<td
									colSpan={columns.length}
									className="px-3 py-8 text-center font-sans text-[13px] text-(--dim)"
								>
									No results found.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{cursorPagination ? (
				<div className="flex items-center justify-between border-x border-b border-(--rule) px-4 py-3">
					<button
						onClick={cursorPagination.onPrev}
						disabled={!cursorPagination.hasPrevPage}
						className="border border-(--rule) px-3 py-1 font-sans text-[12px] text-(--on-surface) transition-colors hover:bg-(--surface-container-low) disabled:opacity-50"
					>
						Previous
					</button>
					<span className="font-sans text-[12px] text-(--dim)">
						Page {cursorPagination.currentPage + 1} of{" "}
						{cursorPagination.totalPages}
					</span>
					<button
						onClick={cursorPagination.onNext}
						disabled={!cursorPagination.hasNextPage}
						className="border border-(--rule) px-3 py-1 font-sans text-[12px] text-(--on-surface) transition-colors hover:bg-(--surface-container-low) disabled:opacity-50"
					>
						Next
					</button>
				</div>
			) : (
				<div className="flex items-center justify-between">
					<span className="font-sans text-[11px] text-(--dim)">
						Page {table.getState().pagination.pageIndex + 1} of{" "}
						{table.getPageCount()}
					</span>
					<div className="flex items-center gap-2">
						<button
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
							className="mono-label cursor-pointer border border-(--rule) bg-(--surface-container-low) px-3 py-1.5 text-[11px] uppercase tracking-[0.05em] text-(--on-surface) transition-colors hover:bg-(--surface-container) disabled:opacity-50"
						>
							Previous
						</button>
						<button
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
							className="mono-label cursor-pointer border border-(--rule) bg-(--surface-container-low) px-3 py-1.5 text-[11px] uppercase tracking-[0.05em] text-(--on-surface) transition-colors hover:bg-(--surface-container) disabled:opacity-50"
						>
							Next
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
