import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/shared/components/ux/ErrorState";
import { useSuperAdminStats } from "../hooks";

export function SuperAdminDashboardPage() {
	const { data: stats, isLoading, isError, refetch } = useSuperAdminStats();

	if (isError) {
		return (
			<ErrorState
				message="Failed to load platform statistics"
				onRetry={() => refetch()}
			/>
		);
	}

	if (isLoading) {
		return (
			<div className="space-y-8">
				<div className="mono-label mb-4 text-[11px] uppercase tracking-[0.05em] text-(--dim)">
					// PLATFORM OVERVIEW
				</div>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{Array.from({ length: 7 }).map((_, i) => (
						<Skeleton
							key={i}
							className="h-[100px] w-full bg-(--surface-container-low)"
						/>
					))}
				</div>
			</div>
		);
	}

	if (!stats) return null;

	const metrics = [
		{ label: "// TOTAL USERS", value: stats.users.total },
		{ label: "// CANDIDATES", value: stats.users.candidates },
		{ label: "// RECRUITERS", value: stats.users.recruiters },
		{
			label: "// COMPANIES",
			value: stats.companies.total,
			sublabel: `${stats.companies.verified} verified`,
		},
		{
			label: "// TOTAL JOBS",
			value: stats.jobs.total,
			sublabel: `${stats.jobs.open} open`,
		},
		{ label: "// OPEN JOBS", value: stats.jobs.open },
		{ label: "// APPLICATIONS", value: stats.applications.total },
	];

	const fillRate =
		stats.companies.total > 0
			? Math.round((stats.companies.verified / stats.companies.total) * 100)
			: 0;
	const candidateToJobRatio =
		stats.jobs.open > 0
			? (stats.users.candidates / stats.jobs.open).toFixed(1)
			: "—";

	return (
		<div className="space-y-8">
			<div>
				<div className="mono-label mb-4 text-[11px] uppercase tracking-[0.05em] text-(--dim)">
					// PLATFORM OVERVIEW
				</div>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{metrics.map((metric) => (
						<div key={metric.label} className="border border-(--rule) p-5">
							<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
								{metric.label}
							</span>
							<p className="mt-2 font-serif text-3xl text-(--on-surface)">
								{metric.value.toLocaleString()}
							</p>
							{metric.sublabel && (
								<p className="mt-1 font-sans text-[12px] text-(--dim)">
									{metric.sublabel}
								</p>
							)}
						</div>
					))}
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<div className="border border-(--rule) p-5">
					<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
						// PLATFORM HEALTH
					</span>
					<div className="mt-4 space-y-4">
						<div className="flex items-center justify-between border-b border-(--rule) pb-3">
							<span className="font-sans text-[13px] text-(--dim)">
								Company Verification Rate
							</span>
							<div className="flex items-center gap-3">
								<div className="h-2 w-32 overflow-hidden bg-(--surface-container-low)">
									<div
										className="h-full bg-(--primary) transition-all"
										style={{ width: `${fillRate}%` }}
									/>
								</div>
								<span className="font-sans text-[13px] text-(--on-surface)">
									{fillRate}%
								</span>
							</div>
						</div>
						<div className="flex items-center justify-between border-b border-(--rule) pb-3">
							<span className="font-sans text-[13px] text-(--dim)">
								Candidate-to-Job Ratio
							</span>
							<span className="font-sans text-[13px] text-(--on-surface)">
								{candidateToJobRatio}:1
							</span>
						</div>
						<div className="flex items-center justify-between border-b border-(--rule) pb-3">
							<span className="font-sans text-[13px] text-(--dim)">
								Open Job Rate
							</span>
							<span className="font-sans text-[13px] text-(--on-surface)">
								{stats.jobs.total > 0
									? `${Math.round((stats.jobs.open / stats.jobs.total) * 100)}%`
									: "—"}
							</span>
						</div>
						<div className="flex items-center justify-between pb-3">
							<span className="font-sans text-[13px] text-(--dim)">
								Recruiter-to-Company Ratio
							</span>
							<span className="font-sans text-[13px] text-(--on-surface)">
								{stats.companies.total > 0
									? (stats.users.recruiters / stats.companies.total).toFixed(1)
									: "—"}
								:1
							</span>
						</div>
					</div>
				</div>

				<div className="border border-(--rule) p-5">
					<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
						// QUICK ACTIONS
					</span>
					<div className="mt-4 space-y-3">
						<a
							href="/superadmin/users"
							className="flex items-center justify-between border border-(--rule) px-4 py-3 font-sans text-[13px] text-(--on-surface) transition-colors hover:bg-(--surface-container-low)"
						>
							Manage Users
							<span className="text-[11px] text-(--dim)">→</span>
						</a>
						<a
							href="/superadmin/companies"
							className="flex items-center justify-between border border-(--rule) px-4 py-3 font-sans text-[13px] text-(--on-surface) transition-colors hover:bg-(--surface-container-low)"
						>
							Review Companies
							<span className="text-[11px] text-(--dim)">→</span>
						</a>
						<a
							href="/superadmin/security"
							className="flex items-center justify-between border border-(--rule) px-4 py-3 font-sans text-[13px] text-(--on-surface) transition-colors hover:bg-(--surface-container-low)"
						>
							Security Events
							<span className="text-[11px] text-(--dim)">→</span>
						</a>
						<a
							href="/superadmin/platform"
							className="flex items-center justify-between border border-(--rule) px-4 py-3 font-sans text-[13px] text-(--on-surface) transition-colors hover:bg-(--surface-container-low)"
						>
							Platform Settings
							<span className="text-[11px] text-(--dim)">→</span>
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}
