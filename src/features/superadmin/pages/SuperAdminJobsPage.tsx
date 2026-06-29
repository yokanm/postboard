import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/shared/components/dialogs/ConfirmDialog";
import { EmptyState } from "@/shared/components/ux/EmptyState";
import { ErrorState } from "@/shared/components/ux/ErrorState";
import { SearchInput } from "@/shared/components/ux/SearchInput";
import { useCursorPagination } from "@/shared/hooks";
import { useSuperAdminForceCloseJob, useSuperAdminJobs } from "../hooks";
import type { SuperAdminJob } from "../types";

export function SuperAdminJobsPage() {
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("");
	const [closeTarget, setCloseTarget] = useState<SuperAdminJob | null>(null);
	const pagination = useCursorPagination();

	const filters = {
		search: search || undefined,
		status: (statusFilter as SuperAdminJob["status"]) || undefined,
		cursor: pagination.cursor,
	};

	const { data, isLoading, isError, refetch } = useSuperAdminJobs(filters);

	const jobs = data?.jobs ?? [];
	const hasNextPage = data?.hasNextPage ?? false;
	const forceCloseMutation = useSuperAdminForceCloseJob();

	const handleSearch = (value: string) => {
		setSearch(value);
		pagination.reset();
	};

	const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setStatusFilter(e.target.value);
		pagination.reset();
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

	const columns = useMemo<ColumnDef<SuperAdminJob>[]>(
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
				header: "Applications",
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
					<div className="text-right">
						{(row.original.status === "OPEN" ||
							row.original.status === "DRAFT") && (
							<button
								onClick={() => setCloseTarget(row.original)}
								className="border border-(--error) px-3 py-1 font-sans text-[11px] text-(--error) transition-colors hover:bg-(--error)/10"
							>
								Force Close
							</button>
						)}
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
			<div className="space-y-4">
				<div className="mono-label mb-4 text-[11px] uppercase tracking-[0.05em] text-(--dim)">
					// JOB MANAGEMENT
				</div>
				<div className="space-y-2">
					{Array.from({ length: 5 }).map((_, i) => (
						<Skeleton
							key={i}
							className="h-12 w-full bg-(--surface-container-low)"
						/>
					))}
				</div>
			</div>
		);
	}

	if (jobs.length === 0) {
		return (
			<div className="space-y-6">
				<div className="mono-label mb-4 text-[11px] uppercase tracking-[0.05em] text-(--dim)">
					// JOB MANAGEMENT
				</div>
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
						search
							? "Try a different search term"
							: "No jobs are currently registered on the platform."
					}
				/>
			</div>
		);
	}

	const totalPages = pagination.cursorStack.length + 1;

	return (
		<div className="space-y-6">
			<div>
				<div className="mono-label mb-4 text-[11px] uppercase tracking-[0.05em] text-(--dim)">
					// JOB MANAGEMENT
				</div>

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
								onChange={handleStatusChange}
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
						currentPage: pagination.currentPage,
						totalPages,
						hasNextPage,
						hasPrevPage: pagination.hasPrevPage,
						onNext: () => pagination.goNext(data?.nextCursor),
						onPrev: pagination.goPrev,
					}}
				/>
			</div>

			<ConfirmDialog
				open={!!closeTarget}
				onOpenChange={(open) => !open && setCloseTarget(null)}
				title="Force Close Job"
				description={`Are you sure you want to force close "${closeTarget?.title}"? This will prevent new applications.`}
				confirmLabel="Force Close"
				variant="danger"
				onConfirm={() => {
					if (closeTarget) {
						forceCloseMutation.mutate(closeTarget.id);
						setCloseTarget(null);
					}
				}}
				isLoading={forceCloseMutation.isPending}
			/>
		</div>
	);
}
