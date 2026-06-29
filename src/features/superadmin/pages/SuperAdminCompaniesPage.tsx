import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/shared/components/dialogs/ConfirmDialog";
import { EmptyState } from "@/shared/components/ux/EmptyState";
import { ErrorState } from "@/shared/components/ux/ErrorState";
import { SearchInput } from "@/shared/components/ux/SearchInput";
import { useCursorPagination } from "@/shared/hooks";
import {
	useSuperAdminCompanies,
	useSuperAdminDeleteCompany,
	useSuperAdminVerifyCompany,
} from "../hooks";
import type { SuperAdminCompanyListItem } from "../types";

export function SuperAdminCompaniesPage() {
	const [search, setSearch] = useState("");
	const [verifyTarget, setVerifyTarget] =
		useState<SuperAdminCompanyListItem | null>(null);
	const [deleteTarget, setDeleteTarget] =
		useState<SuperAdminCompanyListItem | null>(null);
	const pagination = useCursorPagination();

	const { data, isLoading, isError, refetch } = useSuperAdminCompanies({
		search: search || undefined,
		cursor: pagination.cursor,
	});
	const verifyMutation = useSuperAdminVerifyCompany();
	const deleteMutation = useSuperAdminDeleteCompany();

	const companies = data?.companies ?? [];
	const hasNextPage = data?.hasNextPage ?? false;

	const handleSearch = (value: string) => {
		setSearch(value);
		pagination.reset();
	};

	const columns = useMemo<ColumnDef<SuperAdminCompanyListItem>[]>(
		() => [
			{
				header: "Name",
				accessorKey: "name",
				cell: ({ getValue }) => (
					<span className="font-sans text-[13px] text-(--on-surface)">
						{getValue() as string}
					</span>
				),
			},
			{
				header: "Industry",
				accessorKey: "industry",
				cell: ({ getValue }) => (
					<span className="font-sans text-[13px] text-(--dim)">
						{getValue() as string}
					</span>
				),
			},
			{
				header: "Verified",
				accessorKey: "isVerified",
				cell: ({ getValue }) => {
					const verified = getValue() as boolean;
					return (
						<span
							className={`inline-block border px-2 py-0.5 font-sans text-[11px] ${
								verified
									? "border-(--primary) text-(--primary)"
									: "border-(--dim) text-(--dim)"
							}`}
						>
							{verified ? "Yes" : "No"}
						</span>
					);
				},
			},
			{
				header: "Jobs",
				accessorFn: (row) => row._count?.jobs ?? 0,
				cell: ({ getValue }) => (
					<span className="font-sans text-[13px] text-(--dim)">
						{getValue() as number}
					</span>
				),
			},
			{
				header: "Members",
				accessorFn: (row) => row._count?.users ?? 0,
				cell: ({ getValue }) => (
					<span className="font-sans text-[13px] text-(--dim)">
						{getValue() as number}
					</span>
				),
			},
			{
				header: "Actions",
				cell: ({ row }) => (
					<div className="flex justify-end gap-2">
						<button
							onClick={() => setVerifyTarget(row.original)}
							className={`border px-3 py-1 font-sans text-[11px] transition-colors ${
								row.original.isVerified
									? "border-(--dim) text-(--dim)"
									: "border-(--primary) text-(--primary) hover:bg-(--primary)/10"
							}`}
						>
							{row.original.isVerified ? "Unverify" : "Verify"}
						</button>
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
			<ErrorState
				message="Failed to load companies"
				onRetry={() => refetch()}
			/>
		);
	}

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="mono-label mb-4 text-[11px] uppercase tracking-[0.05em] text-(--dim)">
					// COMPANY MANAGEMENT
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

	if (companies.length === 0) {
		return (
			<div className="space-y-6">
				<div className="mono-label mb-4 text-[11px] uppercase tracking-[0.05em] text-(--dim)">
					// COMPANY MANAGEMENT
				</div>
				<div className="mb-4 w-full sm:max-w-xs">
					<SearchInput
						value={search}
						onChange={handleSearch}
						placeholder="Search companies..."
					/>
				</div>
				<EmptyState
					title="No companies found"
					description={
						search
							? "Try a different search term"
							: "No companies registered yet"
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
					// COMPANY MANAGEMENT
				</div>

				<DataTable
					columns={columns}
					data={companies}
					toolbar={
						<>
							<div className="w-full sm:max-w-xs">
								<SearchInput
									value={search}
									onChange={handleSearch}
									placeholder="Search companies..."
								/>
							</div>
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
				open={!!verifyTarget}
				onOpenChange={(open) => !open && setVerifyTarget(null)}
				title={verifyTarget?.isVerified ? "Unverify Company" : "Verify Company"}
				description={`Are you sure you want to ${verifyTarget?.isVerified ? "unverify" : "verify"} "${verifyTarget?.name}"?`}
				confirmLabel={verifyTarget?.isVerified ? "Unverify" : "Verify"}
				onConfirm={() => {
					if (verifyTarget) {
						verifyMutation.mutate({
							companyId: verifyTarget.id,
							isVerified: !verifyTarget.isVerified,
						});
						setVerifyTarget(null);
					}
				}}
				isLoading={verifyMutation.isPending}
			/>

			<ConfirmDialog
				open={!!deleteTarget}
				onOpenChange={(open) => !open && setDeleteTarget(null)}
				title="Delete Company"
				description={`Are you sure you want to permanently delete "${deleteTarget?.name}"? This will also close all jobs and deactivate all team members.`}
				confirmLabel="Delete Permanently"
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
