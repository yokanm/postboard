import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/shared/components/dialogs/ConfirmDialog";
import { EmptyState } from "@/shared/components/ux/EmptyState";
import { ErrorState } from "@/shared/components/ux/ErrorState";
import { SearchInput } from "@/shared/components/ux/SearchInput";
import { useAdminDeleteJob, useAdminJobs, useForceCloseJob } from "../../hooks";
import type { AdminJob, AdminJobFilters } from "../../types";

export function AdminJobTable() {
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("");
	const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([
		undefined,
	]);
	const [currentPage, setCurrentPage] = useState(0);
	const [closeTarget, setCloseTarget] = useState<AdminJob | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<AdminJob | null>(null);

	const filters: AdminJobFilters = {
		search: search || undefined,
		status: (statusFilter as AdminJobFilters["status"]) || undefined,
		cursor: cursorStack[currentPage],
	};

	const { data, isLoading, isError, refetch } = useAdminJobs(filters);
	const closeMutation = useForceCloseJob();
	const deleteMutation = useAdminDeleteJob();

	const jobs = data?.jobs ?? [];
	const hasNextPage = data?.hasNextPage ?? false;

	const handleSearch = (value: string) => {
		setSearch(value);
		setCursorStack([undefined]);
		setCurrentPage(0);
	};

	const handleLoadMore = () => {
		if (data?.nextCursor) {
			setCursorStack((prev) => [...prev, data.nextCursor!]);
			setCurrentPage((prev) => prev + 1);
		}
	};

	const handlePrevPage = () => {
		if (currentPage > 0) {
			setCurrentPage((prev) => prev - 1);
			setCursorStack((prev) => prev.slice(0, -1));
		}
	};

	const statusColor = (status: string) => {
		switch (status) {
			case "OPEN":
				return "border-(--primary) text-(--primary)";
			case "DRAFT":
				return "border-(--dim) text-(--dim)";
			case "CLOSED":
				return "border-(--error) text-(--error)";
			case "EXPIRED":
				return "border-(--warning) text-(--warning)";
			default:
				return "border-(--dim) text-(--dim)";
		}
	};

	const columns = useMemo<ColumnDef<AdminJob>[]>(
		() => [
			{
				header: "Title",
				accessorKey: "title",
				cell: ({ getValue }) => (
					<span className="font-sans text-[13px] text-(--on-surface)">
						{getValue() as string}
					</span>
				),
			},
			{
				header: "Company",
				accessorFn: (row) => row.company?.name ?? "",
				cell: ({ getValue }) => (
					<span className="font-sans text-[13px] text-(--dim)">
						{getValue() as string}
					</span>
				),
			},
			{
				header: "Status",
				accessorKey: "status",
				cell: ({ getValue }) => {
					const status = getValue() as string;
					return (
						<span
							className={`inline-block border px-2 py-0.5 font-sans text-[11px] ${statusColor(status)}`}
						>
							{status}
						</span>
					);
				},
			},
			{
				header: "Apps",
				accessorFn: (row) => row._count?.applications ?? 0,
				cell: ({ getValue }) => (
					<span className="font-sans text-[13px] text-(--dim)">
						{getValue() as number}
					</span>
				),
			},
			{
				header: "Created",
				accessorKey: "createdAt",
				cell: ({ getValue }) => (
					<span className="font-sans text-[13px] text-(--dim)">
						{new Date(getValue() as string).toLocaleDateString()}
					</span>
				),
			},
			{
				header: "Actions",
				cell: ({ row }) => (
					<div className="flex justify-end gap-2">
						{row.original.status === "OPEN" && (
							<button
								onClick={() => setCloseTarget(row.original)}
								className="border border-(--warning) px-3 py-1 font-sans text-[11px] text-(--warning) transition-colors hover:bg-(--warning)/10"
							>
								Close
							</button>
						)}
						<button
							onClick={() => setDeleteTarget(row.original)}
							className="border border-(--error) px-3 py-1 font-sans text-[11px] text-(--error) transition-colors hover:bg-(--error)/10"
						>
							Delete
						</button>
					</div>
				),
			},
		],
		[],
	);

	if (isError) {
		return (
			<ErrorState message="Failed to load jobs" onRetry={() => refetch()} />
		);
	}

	if (isLoading) {
		return (
			<div className="space-y-2">
				{Array.from({ length: 5 }).map((_, i) => (
					<Skeleton
						key={i}
						className="h-12 w-full bg-(--surface-container-low)"
					/>
				))}
			</div>
		);
	}

	if (jobs.length === 0) {
		return (
			<>
				<div className="mb-4 w-full sm:max-w-xs">
					<SearchInput
						value={search}
						onChange={handleSearch}
						placeholder="Search by job title..."
					/>
				</div>
				<EmptyState
					title="No jobs found"
					description={
						search ? "Try a different search term" : "No jobs posted yet"
					}
				/>
			</>
		);
	}

	const totalPages = cursorStack.length;

	return (
		<div>
			<DataTable
				columns={columns}
				data={jobs}
				toolbar={
					<>
						<div className="w-full sm:max-w-xs">
							<SearchInput
								value={search}
								onChange={handleSearch}
								placeholder="Search by job title..."
							/>
						</div>
						<select
							value={statusFilter}
							onChange={(e) => {
								setStatusFilter(e.target.value);
								setCursorStack([undefined]);
								setCurrentPage(0);
							}}
							className="border border-(--rule) bg-(--surface-container-lowest) px-3 py-2 font-sans text-[13px] text-(--on-surface) outline-none"
						>
							<option value="">All Statuses</option>
							<option value="OPEN">Open</option>
							<option value="DRAFT">Draft</option>
							<option value="CLOSED">Closed</option>
							<option value="EXPIRED">Expired</option>
						</select>
					</>
				}
				cursorPagination={{
					currentPage,
					totalPages,
					hasNextPage,
					hasPrevPage: currentPage > 0,
					onNext: handleLoadMore,
					onPrev: handlePrevPage,
				}}
			/>

			<ConfirmDialog
				open={!!closeTarget}
				onOpenChange={(open) => !open && setCloseTarget(null)}
				title="Force Close Job"
				description={`Are you sure you want to close "${closeTarget?.title}"?`}
				confirmLabel="Close Job"
				variant="default"
				onConfirm={() => {
					if (closeTarget) {
						closeMutation.mutate({ jobId: closeTarget.id });
						setCloseTarget(null);
					}
				}}
				isLoading={closeMutation.isPending}
			/>

			<ConfirmDialog
				open={!!deleteTarget}
				onOpenChange={(open) => !open && setDeleteTarget(null)}
				title="Delete Job"
				description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
				confirmLabel="Delete"
				variant="danger"
				onConfirm={() => {
					if (deleteTarget) {
						deleteMutation.mutate(deleteTarget.id);
						setDeleteTarget(null);
					}
				}}
				isLoading={deleteMutation.isPending}
			/>
		</div>
	);
}
