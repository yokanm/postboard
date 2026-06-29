import { Link } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/features/auth/hooks";
import { useCurrentCompany } from "@/features/company/hooks";
import { useJobs } from "@/features/jobs/hooks";
import { StatisticsGrid } from "@/shared/components/recruiter/StatisticsGrid";
import { EmptyState } from "@/shared/components/ux/EmptyState";
import { ErrorState } from "@/shared/components/ux/ErrorState";

export function RecruiterDashboardPage() {
	const {
		data: user,
		isLoading: userLoading,
		isError: userError,
	} = useCurrentUser();
	const {
		data: companyResp,
		isLoading: companyLoading,
		isError: companyError,
	} = useCurrentCompany();
	const company = companyResp?.company ?? null;
	const {
		data: jobsData,
		isLoading: jobsLoading,
		isError: jobsError,
	} = useJobs({
		limit: "100",
		companyId: company?.id ?? undefined,
	});

	const isLoading = userLoading || companyLoading || jobsLoading;
	const isError = userError || companyError || jobsError;

	const jobs = jobsData?.pages?.flatMap((p) => p.jobs) ?? [];
	const openJobs = jobs.filter((j) => j.status === "OPEN");
	const closedJobs = jobs.filter((j) => j.status === "CLOSED");
	const draftJobs = jobs.filter((j) => j.status === "DRAFT");
	const totalApplications = jobs.reduce(
		(sum, j) => sum + (j._count?.applications ?? 0),
		0,
	);

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
				<Skeleton className="h-48 w-full bg-(--surface-container-low)" />
			</div>
		);
	}

	if (isError) {
		return <ErrorState message="Failed to load dashboard data" />;
	}

	return (
		<div className="flex flex-col gap-8">
			<div>
				<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--primary-container)">
					// RECRUITER_DASHBOARD
				</span>
				<h2 className="font-headline mt-2 text-xl text-(--on-surface)">
					Welcome back{user?.firstName ? `, ${user.firstName}` : ""}.
				</h2>
				<p className="mt-1 font-sans text-[13px] text-(--body)">
					Manage your job listings and applicant pipeline.
				</p>
			</div>

			<StatisticsGrid
				stats={[
					{ label: "TOTAL JOBS", value: jobs.length },
					{ label: "OPEN", value: openJobs.length, accent: true },
					{ label: "CLOSED", value: closedJobs.length },
					{ label: "DRAFTS", value: draftJobs.length },
					{ label: "APPLICATIONS", value: totalApplications },
				]}
			/>

			<div>
				<div className="mb-4 flex items-center justify-between">
					<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
						// QUICK ACTIONS
					</span>
				</div>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
					<Link
						to="/recruiter/jobs/create"
						className="border border-(--rule) p-4 text-center transition-colors hover:bg-(--surface-container-low)"
					>
						<span className="mono-label text-[11px] uppercase text-(--primary-container)">
							+ Create Job
						</span>
						<p className="mt-1 font-sans text-[12px] text-(--dim)">
							Post a new position
						</p>
					</Link>
					<Link
						to="/recruiter/jobs"
						className="border border-(--rule) p-4 text-center transition-colors hover:bg-(--surface-container-low)"
					>
						<span className="mono-label text-[11px] uppercase text-(--on-surface)">
							Manage Jobs
						</span>
						<p className="mt-1 font-sans text-[12px] text-(--dim)">
							{jobs.length} listings
						</p>
					</Link>
					<Link
						to="/recruiter/analytics"
						className="border border-(--rule) p-4 text-center transition-colors hover:bg-(--surface-container-low)"
					>
						<span className="mono-label text-[11px] uppercase text-(--on-surface)">
							Analytics
						</span>
						<p className="mt-1 font-sans text-[12px] text-(--dim)">
							View insights
						</p>
					</Link>
				</div>
			</div>

			<div>
				<div className="mb-4 flex items-center justify-between">
					<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
						// RECENT JOBS
					</span>
					<Link
						to="/recruiter/jobs"
						className="mono-label text-[11px] text-(--primary-container) hover:underline"
					>
						View all &rarr;
					</Link>
				</div>
				{jobs.length === 0 ? (
					<EmptyState
						title="No jobs yet"
						description="Create your first job listing to start receiving applications."
						action={{ label: "Create Job", onClick: () => {} }}
					/>
				) : (
					<div className="divide-y divide-(--rule) border border-(--rule)">
						{jobs.slice(0, 5).map((job) => (
							<Link
								key={job.id}
								to="/recruiter/jobs/$jobId/applications"
								params={{ jobId: job.id }}
								className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-(--surface-container-low)"
							>
								<div>
									<p className="font-sans text-[13px] font-medium text-(--on-surface)">
										{job.title}
									</p>
									<p className="font-sans text-[12px] text-(--dim)">
										{job._count?.applications ?? 0} applicant
										{(job._count?.applications ?? 0) !== 1 ? "s" : ""}
									</p>
								</div>
								<span
									className={`mono-label border px-2 py-0.5 text-[10px] uppercase ${
										job.status === "OPEN"
											? "border-(--live) text-(--live)"
											: job.status === "DRAFT"
												? "border-(--dim) text-(--dim)"
												: "border-(--error) text-(--error)"
									}`}
								>
									{job.status}
								</span>
							</Link>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
