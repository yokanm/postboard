import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/shared/components/ux/EmptyState";
import { ErrorState } from "@/shared/components/ux/ErrorState";
import { StatsGrid } from "../components/dashboard/StatsGrid";
import { useAdminAuditLogs, useAdminStats } from "../hooks";

export function AdminDashboardPage() {
	const { data: stats, isLoading, isError, refetch } = useAdminStats();
	const {
		data: auditData,
		isLoading: auditLoading,
		isError: auditError,
	} = useAdminAuditLogs({ limit: 10 });

	if (isError) {
		return (
			<ErrorState
				message="Failed to load platform statistics"
				onRetry={() => refetch()}
			/>
		);
	}

	return (
		<div className="space-y-8">
			<div>
				<div className="mono-label mb-4 text-[11px] uppercase tracking-[0.05em] text-(--dim)">
					// PLATFORM OVERVIEW
				</div>
				{isLoading ? (
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
						{Array.from({ length: 5 }).map((_, i) => (
							<Skeleton
								key={i}
								className="h-[100px] w-full bg-(--surface-container-low)"
							/>
						))}
					</div>
				) : (
					<StatsGrid stats={stats!} />
				)}
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<div className="border border-(--rule) p-5">
					<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
						// RECENT ACTIVITY
					</span>
					<div className="mt-4">
						{auditLoading ? (
							<div className="space-y-3">
								{Array.from({ length: 5 }).map((_, i) => (
									<Skeleton
										key={i}
										className="h-8 w-full bg-(--surface-container-low)"
									/>
								))}
							</div>
						) : auditError ? (
							<p className="font-sans text-[13px] text-(--dim)">
								Unable to load activity feed.
							</p>
						) : !auditData?.logs || auditData.logs.length === 0 ? (
							<EmptyState
								title="No recent activity"
								description="Administrative actions will appear here."
							/>
						) : (
							<div className="space-y-2">
								{auditData.logs.slice(0, 10).map((log) => (
									<div
										key={log.id}
										className="flex items-center justify-between border-b border-(--rule) pb-2 last:border-b-0"
									>
										<div className="flex items-center gap-3">
											<span className="mono-label min-w-[80px] text-[10px] uppercase tracking-[0.05em] text-(--primary-container)">
												{log.action.replace(/_/g, " ")}
											</span>
											<span className="font-sans text-[13px] text-(--on-surface)">
												{log.actor?.userName ?? "System"}
											</span>
										</div>
										<span className="font-sans text-[11px] text-(--dim)">
											{new Date(log.createdAt).toLocaleString()}
										</span>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				<div className="border border-(--rule) p-5">
					<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
						// QUICK ACTIONS
					</span>
					<div className="mt-4 space-y-3">
						<a
							href="/admin/users"
							className="flex items-center justify-between border border-(--rule) px-4 py-3 font-sans text-[13px] text-(--on-surface) transition-colors hover:bg-(--surface-container-low)"
						>
							Manage Users
							<span className="text-[11px] text-(--dim)">→</span>
						</a>
						<a
							href="/admin/companies"
							className="flex items-center justify-between border border-(--rule) px-4 py-3 font-sans text-[13px] text-(--on-surface) transition-colors hover:bg-(--surface-container-low)"
						>
							Review Companies
							<span className="text-[11px] text-(--dim)">→</span>
						</a>
						<a
							href="/admin/jobs"
							className="flex items-center justify-between border border-(--rule) px-4 py-3 font-sans text-[13px] text-(--on-surface) transition-colors hover:bg-(--surface-container-low)"
						>
							Moderate Jobs
							<span className="text-[11px] text-(--dim)">→</span>
						</a>
						<a
							href="/admin/analytics"
							className="flex items-center justify-between border border-(--rule) px-4 py-3 font-sans text-[13px] text-(--on-surface) transition-colors hover:bg-(--surface-container-low)"
						>
							View Analytics
							<span className="text-[11px] text-(--dim)">→</span>
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}
