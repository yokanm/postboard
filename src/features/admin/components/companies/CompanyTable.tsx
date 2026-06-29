import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/shared/components/dialogs/ConfirmDialog";
import { EmptyState } from "@/shared/components/ux/EmptyState";
import { ErrorState } from "@/shared/components/ux/ErrorState";
import { SearchInput } from "@/shared/components/ux/SearchInput";
import { useAdminCompanies, useVerifyCompany } from "../../hooks";
import type { AdminCompany, AdminCompanyFilters } from "../../types";

export function CompanyTable() {
	const [search, setSearch] = useState("");
	const [verifiedFilter, setVerifiedFilter] = useState<string>("");
	const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([
		undefined,
	]);
	const [currentPage, setCurrentPage] = useState(0);
	const [verifyTarget, setVerifyTarget] = useState<AdminCompany | null>(null);

	const filters: AdminCompanyFilters = {
		search: search || undefined,
		verified:
			verifiedFilter === "verified"
				? true
				: verifiedFilter === "unverified"
					? false
					: undefined,
		cursor: cursorStack[currentPage],
	};

	const { data, isLoading, isError, refetch } = useAdminCompanies(filters);
	const verifyMutation = useVerifyCompany();

	const companies = data?.companies ?? [];
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

	const columns = useMemo<ColumnDef<AdminCompany>[]>(
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
				header: "Size",
				accessorKey: "size",
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
					<div className="text-right">
						<button
							onClick={() => setVerifyTarget(row.original)}
							className={`border px-3 py-1 font-sans text-[11px] transition-colors ${
								row.original.isVerified
									? "border-(--dim) text-(--dim) hover:bg-(--surface-container-low)"
									: "border-(--primary) text-(--primary) hover:bg-(--primary)/10"
							}`}
						>
							{row.original.isVerified ? "Unverify" : "Verify"}
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

	if (companies.length === 0) {
		return (
			<>
				<div className="mb-4 w-full sm:max-w-xs">
					<SearchInput
						value={search}
						onChange={handleSearch}
						placeholder="Search by name or email..."
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
			</>
		);
	}

	const totalPages = cursorStack.length;

	return (
		<div>
			<DataTable
				columns={columns}
				data={companies}
				toolbar={
					<>
						<div className="w-full sm:max-w-xs">
							<SearchInput
								value={search}
								onChange={handleSearch}
								placeholder="Search by name or email..."
							/>
						</div>
						<select
							value={verifiedFilter}
							onChange={(e) => {
								setVerifiedFilter(e.target.value);
								setCursorStack([undefined]);
								setCurrentPage(0);
							}}
							className="border border-(--rule) bg-(--surface-container-lowest) px-3 py-2 font-sans text-[13px] text-(--on-surface) outline-none"
						>
							<option value="">All Companies</option>
							<option value="verified">Verified Only</option>
							<option value="unverified">Unverified Only</option>
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
				open={!!verifyTarget}
				onOpenChange={(open) => !open && setVerifyTarget(null)}
				title={verifyTarget?.isVerified ? "Unverify Company" : "Verify Company"}
				description={`Are you sure you want to ${verifyTarget?.isVerified ? "unverify" : "verify"} "${verifyTarget?.name}"?`}
				confirmLabel={verifyTarget?.isVerified ? "Unverify" : "Verify"}
				variant="default"
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
		</div>
	);
}
