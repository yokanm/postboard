import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/shared/components/dialogs/ConfirmDialog";
import { EmptyState } from "@/shared/components/ux/EmptyState";
import { ErrorState } from "@/shared/components/ux/ErrorState";
import { useCursorPagination } from "@/shared/hooks";
import {
	useSuperAdminOwnerlessCompanies,
	useSuperAdminRecoverOwnership,
} from "../hooks";
import type { SuperAdminCompanyListItem } from "../types";

export function SuperAdminPlatformPage() {
	const [recoverTarget, setRecoverTarget] =
		useState<SuperAdminCompanyListItem | null>(null);
	const pagination = useCursorPagination();

	const { data, isLoading, isError, refetch } = useSuperAdminOwnerlessCompanies(
		{
			cursor: pagination.cursor,
		},
	);
	const recoverMutation = useSuperAdminRecoverOwnership();

	const companies = data?.companies ?? [];
	const hasNextPage = data?.hasNextPage ?? false;

	const handleRecover = async () => {
		if (!recoverTarget) return;
		await recoverMutation.mutateAsync(recoverTarget.id);
		setRecoverTarget(null);
	};

	if (isError) {
		return (
			<ErrorState
				message="Failed to load ownerless companies"
				onRetry={() => refetch()}
			/>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<div className="mono-label mb-4 text-[11px] uppercase tracking-[0.05em] text-(--dim)">
					// PLATFORM CONFIGURATION
				</div>
				<p className="mb-6 font-sans text-[13px] text-(--dim)">
					Manage platform configuration and resolve ownerless companies that
					require ownership recovery.
				</p>

				<div className="mb-6">
					<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
						// OWNERLESS COMPANIES
					</span>
				</div>

				{isLoading ? (
					<div className="space-y-2">
						{Array.from({ length: 3 }).map((_, i) => (
							<Skeleton
								key={i}
								className="h-12 w-full bg-(--surface-container-low)"
							/>
						))}
					</div>
				) : companies.length === 0 ? (
					<EmptyState
						title="No ownerless companies"
						description="All companies have valid owners. This panel monitors companies that need ownership recovery."
					/>
				) : (
					<>
						<div className="overflow-x-auto border border-(--rule)">
							<table className="w-full border-collapse">
								<thead>
									<tr className="border-b border-(--rule) bg-(--surface-container-low)">
										<th className="mono-label px-4 py-3 text-left text-[11px] uppercase tracking-[0.05em] text-(--dim)">
											Company
										</th>
										<th className="mono-label px-4 py-3 text-left text-[11px] uppercase tracking-[0.05em] text-(--dim)">
											Industry
										</th>
										<th className="mono-label px-4 py-3 text-left text-[11px] uppercase tracking-[0.05em] text-(--dim)">
											Jobs
										</th>
										<th className="mono-label px-4 py-3 text-left text-[11px] uppercase tracking-[0.05em] text-(--dim)">
											Members
										</th>
										<th className="mono-label px-4 py-3 text-right text-[11px] uppercase tracking-[0.05em] text-(--dim)">
											Actions
										</th>
									</tr>
								</thead>
								<tbody>
									{companies.map((company) => (
										<tr
											key={company.id}
											className="border-b border-(--rule) transition-colors hover:bg-(--surface-container-low)"
										>
											<td className="px-4 py-3 font-sans text-[13px] text-(--on-surface)">
												{company.name}
											</td>
											<td className="px-4 py-3 font-sans text-[13px] text-(--dim)">
												{company.industry}
											</td>
											<td className="px-4 py-3 font-sans text-[13px] text-(--dim)">
												{company._count.jobs}
											</td>
											<td className="px-4 py-3 font-sans text-[13px] text-(--dim)">
												{company._count.users}
											</td>
											<td className="px-4 py-3 text-right">
												<button
													onClick={() => setRecoverTarget(company)}
													className="border border-(--primary) px-3 py-1 font-sans text-[11px] text-(--primary) transition-colors hover:bg-(--primary)/10"
												>
													Recover
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
				open={!!recoverTarget}
				onOpenChange={(open) => !open && setRecoverTarget(null)}
				title="Recover Ownership"
				description={`Initiate ownership recovery for "${recoverTarget?.name}"? This will allow reassigning the company to a new owner.`}
				confirmLabel="Recover"
				onConfirm={handleRecover}
				isLoading={recoverMutation.isPending}
			/>
		</div>
	);
}
