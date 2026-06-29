import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/shared/components/dialogs/ConfirmDialog";
import { EmptyState } from "@/shared/components/ux/EmptyState";
import { ErrorState } from "@/shared/components/ux/ErrorState";
import { SearchInput } from "@/shared/components/ux/SearchInput";
import { useCursorPagination } from "@/shared/hooks";
import { useBanCandidate, useSuperAdminCandidates } from "../hooks";
import type { SuperAdminCandidate } from "../types";

export function SuperAdminUsersPage() {
	const [search, setSearch] = useState("");
	const [banTarget, setBanTarget] = useState<SuperAdminCandidate | null>(null);
	const pagination = useCursorPagination();

	const { data, isLoading, isError, refetch } = useSuperAdminCandidates({
		search: search || undefined,
		cursor: pagination.cursor,
	});
	const banMutation = useBanCandidate();

	const candidates = data?.candidates ?? [];
	const hasNextPage = data?.hasNextPage ?? false;

	const handleSearch = (value: string) => {
		setSearch(value);
		pagination.reset();
	};

	const handleBan = async () => {
		if (!banTarget) return;
		await banMutation.mutateAsync(banTarget.id);
		setBanTarget(null);
	};

	if (isError) {
		return (
			<ErrorState message="Failed to load users" onRetry={() => refetch()} />
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<div className="mono-label mb-4 text-[11px] uppercase tracking-[0.05em] text-(--dim)">
					// USER MANAGEMENT
				</div>
				<p className="mb-4 font-sans text-[13px] text-(--dim)">
					Note: SuperAdmin user management is limited to candidate accounts. Use
					the Admin panel for full user management.
				</p>

				<div className="mb-4 w-full sm:max-w-xs">
					<SearchInput
						value={search}
						onChange={handleSearch}
						placeholder="Search candidates..."
					/>
				</div>

				{isLoading ? (
					<div className="space-y-2">
						{Array.from({ length: 5 }).map((_, i) => (
							<Skeleton
								key={i}
								className="h-12 w-full bg-(--surface-container-low)"
							/>
						))}
					</div>
				) : candidates.length === 0 ? (
					<EmptyState
						title="No candidates found"
						description={
							search
								? "Try a different search term"
								: "No candidates registered yet"
						}
					/>
				) : (
					<>
						<div className="overflow-x-auto border border-(--rule)">
							<table className="w-full border-collapse">
								<thead>
									<tr className="border-b border-(--rule) bg-(--surface-container-low)">
										<th className="mono-label px-4 py-3 text-left text-[11px] uppercase tracking-[0.05em] text-(--dim)">
											Name
										</th>
										<th className="mono-label px-4 py-3 text-left text-[11px] uppercase tracking-[0.05em] text-(--dim)">
											Email
										</th>
										<th className="mono-label px-4 py-3 text-left text-[11px] uppercase tracking-[0.05em] text-(--dim)">
											Verified
										</th>
										<th className="mono-label px-4 py-3 text-left text-[11px] uppercase tracking-[0.05em] text-(--dim)">
											Applications
										</th>
										<th className="mono-label px-4 py-3 text-left text-[11px] uppercase tracking-[0.05em] text-(--dim)">
											Joined
										</th>
										<th className="mono-label px-4 py-3 text-right text-[11px] uppercase tracking-[0.05em] text-(--dim)">
											Actions
										</th>
									</tr>
								</thead>
								<tbody>
									{candidates.map((c) => (
										<tr
											key={c.id}
											className="border-b border-(--rule) transition-colors hover:bg-(--surface-container-low)"
										>
											<td className="px-4 py-3 font-sans text-[13px] text-(--on-surface)">
												{c.firstName} {c.lastName}
											</td>
											<td className="px-4 py-3 font-sans text-[13px] text-(--dim)">
												{c.email}
											</td>
											<td className="px-4 py-3">
												<span
													className={`inline-block border px-2 py-0.5 font-sans text-[11px] ${c.isVerified ? "border-(--primary) text-(--primary)" : "border-(--dim) text-(--dim)"}`}
												>
													{c.isVerified ? "Yes" : "No"}
												</span>
											</td>
											<td className="px-4 py-3 font-sans text-[13px] text-(--dim)">
												{c._count?.applications ?? 0}
											</td>
											<td className="px-4 py-3 font-sans text-[13px] text-(--dim)">
												{new Date(c.createdAt).toLocaleDateString()}
											</td>
											<td className="px-4 py-3 text-right">
												<button
													onClick={() => setBanTarget(c)}
													className="border border-(--error) px-3 py-1 font-sans text-[11px] text-(--error) transition-colors hover:bg-(--error)/10"
												>
													Ban
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						<div className="flex items-center justify-between border-x border-b border-(--rule) px-4 py-3">
							<button
								onClick={pagination.goPrev}
								disabled={!pagination.hasPrevPage}
								className="border border-(--rule) px-3 py-1 font-sans text-[12px] text-(--on-surface) disabled:opacity-50"
							>
								Previous
							</button>
							<button
								onClick={() => pagination.goNext(data?.nextCursor)}
								disabled={!hasNextPage}
								className="border border-(--rule) px-3 py-1 font-sans text-[12px] text-(--on-surface) disabled:opacity-50"
							>
								Next
							</button>
						</div>
					</>
				)}
			</div>

			<ConfirmDialog
				open={!!banTarget}
				onOpenChange={(open) => !open && setBanTarget(null)}
				title="Ban Candidate"
				description={`Are you sure you want to ban ${banTarget?.firstName} ${banTarget?.lastName}? This will deactivate their account.`}
				confirmLabel="Ban Account"
				variant="danger"
				onConfirm={handleBan}
				isLoading={banMutation.isPending}
			/>
		</div>
	);
}
