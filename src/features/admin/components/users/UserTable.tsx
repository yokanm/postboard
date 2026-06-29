import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/shared/components/dialogs/ConfirmDialog";
import { EmptyState } from "@/shared/components/ux/EmptyState";
import { ErrorState } from "@/shared/components/ux/ErrorState";
import { SearchInput } from "@/shared/components/ux/SearchInput";
import { useAdminUsers, useDeactivateUser } from "../../hooks";
import type { AdminUser, AdminUserFilters } from "../../types";

interface UserTableProps {
	pageSize?: number;
	onSelectUser?: (user: AdminUser) => void;
}

export function UserTable({ pageSize = 20, onSelectUser }: UserTableProps) {
	const [search, setSearch] = useState("");
	const [roleFilter, setRoleFilter] = useState<string>("");
	const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([
		undefined,
	]);
	const [currentPage, setCurrentPage] = useState(0);
	const [deactivateTarget, setDeactivateTarget] = useState<AdminUser | null>(
		null,
	);

	const filters: AdminUserFilters = {
		search: search || undefined,
		role: (roleFilter as AdminUserFilters["role"]) || undefined,
		limit: pageSize,
		cursor: cursorStack[currentPage],
	};

	const { data, isLoading, isError, refetch } = useAdminUsers(filters);
	const deactivateMutation = useDeactivateUser();

	const users = data?.users ?? [];
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

	const handleDeactivate = async () => {
		if (!deactivateTarget) return;
		await deactivateMutation.mutateAsync(deactivateTarget.id);
		setDeactivateTarget(null);
	};

	const columns = useMemo<ColumnDef<AdminUser>[]>(
		() => [
			{
				header: "Name",
				accessorFn: (row) => `${row.firstName} ${row.lastName}`,
				cell: ({ row, getValue }) => (
					<button
						onClick={() => onSelectUser?.(row.original)}
						className="font-sans text-[13px] text-(--on-surface) hover:text-(--primary)"
					>
						{getValue() as string}
					</button>
				),
			},
			{
				header: "Email",
				accessorKey: "email",
				cell: ({ getValue }) => (
					<span className="font-sans text-[13px] text-(--dim)">
						{getValue() as string}
					</span>
				),
			},
			{
				header: "Role",
				accessorKey: "role",
				cell: ({ getValue }) => (
					<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--primary-container)">
						{getValue() as string}
					</span>
				),
			},
			{
				header: "Status",
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
							{verified ? "Verified" : "Unverified"}
						</span>
					);
				},
			},
			{
				header: "Joined",
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
						<button
							onClick={() => setDeactivateTarget(row.original)}
							className="border border-(--error) px-3 py-1 font-sans text-[11px] text-(--error) transition-colors hover:bg-(--error)/10"
						>
							Deactivate
						</button>
					</div>
				),
			},
		],
		[onSelectUser],
	);

	if (isError) {
		return (
			<ErrorState message="Failed to load users" onRetry={() => refetch()} />
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

	if (users.length === 0) {
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
					title="No users found"
					description={
						search ? "Try a different search term" : "No users registered yet"
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
				data={users}
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
							value={roleFilter}
							onChange={(e) => {
								setRoleFilter(e.target.value);
								setCursorStack([undefined]);
								setCurrentPage(0);
							}}
							className="border border-(--rule) bg-(--surface-container-lowest) px-3 py-2 font-sans text-[13px] text-(--on-surface) outline-none"
						>
							<option value="">All Roles</option>
							<option value="CANDIDATE">Candidates</option>
							<option value="RECRUITER">Recruiters</option>
							<option value="ADMIN">Admins</option>
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
				open={!!deactivateTarget}
				onOpenChange={(open) => !open && setDeactivateTarget(null)}
				title="Deactivate User"
				description={`Are you sure you want to deactivate ${deactivateTarget?.firstName} ${deactivateTarget?.lastName}? This action can be reversed.`}
				confirmLabel="Deactivate"
				variant="danger"
				onConfirm={handleDeactivate}
				isLoading={deactivateMutation.isPending}
			/>
		</div>
	);
}
