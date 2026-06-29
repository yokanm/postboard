import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/features/auth/hooks";
import { useCurrentCompany } from "@/features/company/hooks";
import { StatisticsGrid } from "@/shared/components/recruiter/StatisticsGrid";
import { EmptyState } from "@/shared/components/ux/EmptyState";
import { ErrorState } from "@/shared/components/ux/ErrorState";
import { useRecruiterAnalytics } from "../hooks";

export function RecruiterAnalyticsPage() {
	const { data: user } = useCurrentUser();
	const { data: companyResp } = useCurrentCompany();
	const company = companyResp?.company ?? null;
	const {
		data: analytics,
		isLoading,
		isError,
		error,
	} = useRecruiterAnalytics(user?.id ?? "");

	if (isLoading) {
		return (
			<div className="flex flex-col gap-6">
				<Skeleton className="h-8 w-64 bg-(--surface-container-low)" />
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton
							key={i}
							className="h-24 w-full bg-(--surface-container-low)"
						/>
					))}
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<ErrorState
				message={(error as Error)?.message ?? "Failed to load analytics"}
			/>
		);
	}

	if (!analytics) return null;

	return (
		<div className="flex flex-col gap-8">
			<div>
				<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--primary-container)">
					// MY_ANALYTICS
				</span>
				<h2 className="font-headline mt-2 text-xl text-(--on-surface)">
					Your Performance{company ? ` at ${company.name}` : ""}
				</h2>
			</div>

			<StatisticsGrid
				stats={[
					{ label: "JOBS CREATED", value: analytics.jobsCreated },
					{
						label: "JOBS PUBLISHED",
						value: analytics.jobsPublished,
						accent: true,
					},
					{ label: "TOTAL APPLICATIONS", value: analytics.applications.total },
					{ label: "PENDING REVIEW", value: analytics.applications.pending },
				]}
			/>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<div className="border border-(--rule) p-5">
					<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
						// REVIEWED
					</span>
					<p className="mt-2 font-serif text-3xl text-(--on-surface)">
						{analytics.applications.reviewed}
					</p>
				</div>
				<div className="border border-(--rule) p-5">
					<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
						// SHORTLISTED
					</span>
					<p className="mt-2 font-serif text-3xl text-(--primary-container)">
						{analytics.applications.shortlisted}
					</p>
				</div>
				<div className="border border-(--rule) p-5">
					<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
						// ACCEPTED
					</span>
					<p className="mt-2 font-serif text-3xl text-(--live)">
						{analytics.applications.accepted}
					</p>
				</div>
				<div className="border border-(--rule) p-5">
					<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
						// REJECTED
					</span>
					<p className="mt-2 font-serif text-3xl text-(--error)">
						{analytics.applications.rejected}
					</p>
				</div>
			</div>

			{analytics.recentActivity.length > 0 && (
				<div>
					<div className="mb-4">
						<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
							// RECENT ACTIVITY
						</span>
					</div>
					<div className="divide-y divide-(--rule) border border-(--rule)">
						{analytics.recentActivity.map((activity) => (
							<div key={activity.id} className="px-4 py-3">
								<p className="font-sans text-[13px] text-(--on-surface)">
									{activity.message}
								</p>
								<p className="font-sans text-[12px] text-(--dim)">
									{new Date(activity.createdAt).toLocaleDateString("en-US", {
										month: "short",
										day: "numeric",
										hour: "2-digit",
										minute: "2-digit",
									})}
								</p>
							</div>
						))}
					</div>
				</div>
			)}

			{analytics.recentActivity.length === 0 && (
				<EmptyState
					title="No recent activity"
					description="Your activity will appear here as you manage jobs and review applicants."
				/>
			)}
		</div>
	);
}
