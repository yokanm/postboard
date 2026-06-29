import { Link } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { ApplicationStatusBadge } from "@/features/applications/components/ApplicationStatusBadge";
import { useMyApplications } from "@/features/applications/hooks";
import { useCurrentUser } from "@/features/auth/hooks";
import { useJobs } from "@/features/jobs/hooks";
import { useUnreadCount } from "@/features/notifications/hooks";
import { useProfile } from "@/features/profile/hooks";
import { ErrorState } from "@/shared/components/ux/ErrorState";
import { useSavedJobsStore } from "@/stores";

export function CandidateDashboardPage() {
	const {
		data: user,
		isLoading: userLoading,
		error: userError,
	} = useCurrentUser();
	const {
		data: appsData,
		isLoading: appsLoading,
		error: appsError,
	} = useMyApplications();
	const { data: unreadData } = useUnreadCount();
	const {
		data: profileData,
		isLoading: profileLoading,
		error: profileError,
	} = useProfile();
	const savedJobs = useSavedJobsStore((s) => s.savedIds);
	const { data: jobsData } = useJobs();
	const allJobs = jobsData?.jobs ?? [];

	const isLoading = userLoading || appsLoading || profileLoading;
	const criticalError = userError || appsError || profileError;
	const applications = appsData?.applications ?? [];
	const appCount = applications.length;
	const pendingCount = applications.filter(
		(a) => a.status === "PENDING",
	).length;
	const reviewedCount = applications.filter(
		(a) => a.status === "REVIEWED" || a.status === "SHORTLISTED",
	).length;
	const acceptedCount = applications.filter(
		(a) => a.status === "ACCEPTED",
	).length;
	const recentApps = applications.slice(0, 5);
	const savedCount = savedJobs.length;
	const unreadCount = unreadData?.unreadCount ?? 0;

	const profile = profileData?.profile;
	const profileFields = [
		profile?.bio,
		profile?.location,
		profile?.skills?.length,
		profile?.resumeUrl,
		profile?.linkedinUrl,
	];
	const filledFields = profileFields.filter(Boolean).length;
	const profileCompletion =
		profileFields.length > 0
			? Math.round((filledFields / profileFields.length) * 100)
			: 0;

	const recommendedJobs = allJobs.slice(0, 3);

	if (isLoading) {
		return (
			<div className="flex flex-col gap-6 p-6">
				<Skeleton className="h-8 w-64" />
				<div className="grid grid-cols-1 gap-0 border border-(--rule) sm:grid-cols-2 lg:grid-cols-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton
							key={i}
							className="h-28 w-full border-r border-(--rule) last:border-r-0"
						/>
					))}
				</div>
			</div>
		);
	}

	if (criticalError) {
		return (
			<ErrorState
				message={
					criticalError instanceof Error
						? criticalError.message
						: "Failed to load dashboard data. Please try again."
				}
			/>
		);
	}

	return (
		<div className="flex flex-col p-4 sm:p-6">
			<div className="relative mx-auto w-full max-w-[1280px] flex-1 space-y-6 sm:space-y-8">
				<div
					className="pointer-events-none absolute inset-0 opacity-[0.03]"
					style={{
						backgroundImage: "radial-gradient(var(--rule) 1px, transparent 0)",
						backgroundSize: "20px 20px",
					}}
				/>

				{/* Hero */}
				<div className="space-y-1">
					<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
						// CANDIDATE_DASHBOARD
					</span>
					<h2 className="font-headline m-0 text-2xl text-(--on-surface) sm:text-[32px]">
						Welcome back{user?.firstName ? `, ${user.firstName}` : ""}.
					</h2>
				</div>

				{/* Stat Tiles */}
				<div className="grid grid-cols-1 gap-0 border border-(--rule) sm:grid-cols-2 lg:grid-cols-4">
					<div className="border-b border-(--rule) p-5 transition-colors hover:bg-(--surface-container) sm:border-b-0 sm:border-r sm:last:border-r-0 lg:border-r">
						<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
							// APPLICATIONS
						</span>
						<p className="mt-3 font-serif text-4xl text-(--on-surface)">
							{appCount}
						</p>
						<span className="mono-label mt-1 block text-[10px] text-(--dim)">
							Total submitted
						</span>
					</div>
					<div className="border-b border-(--rule) p-5 transition-colors hover:bg-(--surface-container) sm:border-b-0 sm:border-r sm:last:border-r-0 lg:border-r">
						<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
							// IN_REVIEW
						</span>
						<p className="mt-3 font-serif text-4xl text-(--primary)">
							{reviewedCount}
						</p>
						<span className="mono-label mt-1 block text-[10px] text-(--dim)">
							{pendingCount} pending
						</span>
					</div>
					<div className="border-b border-(--rule) p-5 transition-colors hover:bg-(--surface-container) sm:border-b-0 sm:border-r sm:last:border-r-0 lg:border-r">
						<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
							// SAVED
						</span>
						<p className="mt-3 font-serif text-4xl text-(--on-surface)">
							{savedCount}
						</p>
						<span className="mono-label mt-1 block text-[10px] text-(--dim)">
							Saved jobs
						</span>
					</div>
					<div className="border-b border-(--rule) p-5 transition-colors hover:bg-(--surface-container) sm:border-b-0 lg:border-r-0">
						<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
							// PROFILE
						</span>
						<p className="mt-3 font-serif text-4xl text-(--primary)">
							{profileCompletion}%
						</p>
						<div className="mt-2 h-1 w-full bg-(--surface-container-high)">
							<div
								className="h-full bg-(--primary) transition-all"
								style={{ width: `${profileCompletion}%` }}
								role="progressbar"
								aria-valuenow={profileCompletion}
								aria-valuemin={0}
								aria-valuemax={100}
							/>
						</div>
					</div>
				</div>

				{/* Mobile: 2x2 Stat Grid */}
				<div className="grid grid-cols-2 gap-px border border-(--rule) bg-(--rule) sm:hidden">
					<div className="bg-(--ink) p-4">
						<span className="mono-label text-[10px] uppercase tracking-[0.05em] text-(--dim)">
							// SAVED
						</span>
						<p className="mt-1 font-serif text-2xl text-(--on-surface)">
							{savedCount}
						</p>
					</div>
					<div className="bg-(--ink) p-4">
						<span className="mono-label text-[10px] uppercase tracking-[0.05em] text-(--dim)">
							// UNREAD
						</span>
						<p className="mt-1 font-serif text-2xl text-(--primary)">
							{unreadCount}
						</p>
					</div>
					<div className="bg-(--ink) p-4">
						<span className="mono-label text-[10px] uppercase tracking-[0.05em] text-(--dim)">
							// ACTIVE
						</span>
						<p className="mt-1 font-serif text-2xl text-(--on-surface)">
							{pendingCount + reviewedCount}
						</p>
					</div>
					<div className="bg-(--ink) p-4">
						<span className="mono-label text-[10px] uppercase tracking-[0.05em] text-(--dim)">
							// OFFERS
						</span>
						<p className="mt-1 font-serif text-2xl text-(--live)">
							{acceptedCount}
						</p>
					</div>
				</div>

				{/* Bento Grid: Timeline + Suggested */}
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
					{/* Recent Activity / Applications */}
					<div className="border border-(--rule) bg-(--ink) p-5 lg:col-span-7">
						<div className="mb-6 flex items-center justify-between">
							<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
								// RECENT APPLICATIONS
							</span>
							{appCount > 0 && (
								<Link
									to="/candidate/applications"
									className="mono-label text-[11px] text-(--primary) hover:underline"
								>
									View all &rarr;
								</Link>
							)}
						</div>
						{recentApps.length === 0 ? (
							<div className="py-8 text-center">
								<p className="font-sans text-[13px] text-(--dim)">
									No applications yet.
								</p>
								<Link
									to="/jobs"
									className="mono-label mt-2 inline-block text-[11px] text-(--primary) hover:underline"
								>
									Browse Jobs
								</Link>
							</div>
						) : (
							<div className="space-y-1">
								{recentApps.map((app) => {
									const date = new Date(app.createdAt).toLocaleDateString(
										"en-US",
										{ month: "short", day: "numeric" },
									);
									return (
										<Link
											key={app.id}
											to="/candidate/applications/$applicationId"
											params={{ applicationId: app.id }}
											className="flex items-center justify-between border border-(--rule) px-4 py-3 transition-colors hover:border-(--primary)/50"
										>
											<div className="min-w-0 flex-1">
												<p className="truncate font-sans text-[13px] font-medium text-(--on-surface)">
													{app.job.title}
												</p>
												<p className="font-sans text-[12px] text-(--dim)">
													{app.job.company.name} &middot; {date}
												</p>
											</div>
											<ApplicationStatusBadge status={app.status} />
										</Link>
									);
								})}
							</div>
						)}
					</div>

					{/* Suggested Roles */}
					<div className="border border-(--rule) bg-(--ink) p-5 lg:col-span-5">
						<div className="mb-6 flex items-center justify-between">
							<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
								// RECOMMENDED
							</span>
							<Link
								to="/jobs"
								className="mono-label text-[11px] text-(--primary) hover:underline"
							>
								Browse all &rarr;
							</Link>
						</div>
						{recommendedJobs.length === 0 ? (
							<div className="py-8 text-center">
								<p className="font-sans text-[13px] text-(--dim)">
									No jobs available at the moment.
								</p>
							</div>
						) : (
							<div className="space-y-3">
								{recommendedJobs.map((job) => (
									<Link
										key={job.id}
										to="/jobs/$jobId"
										params={{ jobId: job.id }}
										className="group block border border-(--rule) p-4 transition-colors hover:border-(--primary)"
									>
										<div className="mb-2 flex items-center justify-between">
											<div className="flex h-8 w-8 items-center justify-center border border-(--rule) bg-(--surface-container-low)">
												<span className="font-mono-label text-[10px] uppercase text-(--dim)">
													{job.company.name.charAt(0)}
												</span>
											</div>
											<span className="mono-label rounded-none bg-(--live-dim) px-2 py-0.5 text-[10px] text-(--live)">
												Recommended
											</span>
										</div>
										<h5 className="font-sans text-[13px] font-semibold text-(--on-surface) transition-colors group-hover:text-(--primary)">
											{job.title}
										</h5>
										<p className="mono-label text-[10px] uppercase tracking-tighter text-(--dim)">
											{job.company.name} &middot; {job.locationType}
										</p>
										<div className="mt-3 flex items-center justify-between border-t border-(--rule) pt-3">
											<span className="mono-label text-[11px] text-(--on-surface)">
												{job.salaryMin && job.salaryMax
													? `$${Number(job.salaryMin).toLocaleString()} — $${Number(job.salaryMax).toLocaleString()}`
													: "Salary not listed"}
											</span>
										</div>
									</Link>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Quick Actions */}
				<div>
					<span className="mono-label mb-4 block text-[11px] uppercase tracking-[0.05em] text-(--dim)">
						// QUICK ACTIONS
					</span>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
						<Link
							to="/jobs"
							className="border border-(--rule) p-4 text-center transition-colors hover:bg-(--surface-container-low)"
						>
							<span className="mono-label text-[11px] uppercase text-(--primary)">
								Browse Jobs
							</span>
							<p className="mt-1 font-sans text-[12px] text-(--dim)">
								Find your next role
							</p>
						</Link>
						<Link
							to="/candidate/applications"
							className="border border-(--rule) p-4 text-center transition-colors hover:bg-(--surface-container-low)"
						>
							<span className="mono-label text-[11px] uppercase text-(--on-surface)">
								My Applications
							</span>
							<p className="mt-1 font-sans text-[12px] text-(--dim)">
								{appCount} submitted
							</p>
						</Link>
						<Link
							to="/candidate/profile"
							className="border border-(--rule) p-4 text-center transition-colors hover:bg-(--surface-container-low)"
						>
							<span className="mono-label text-[11px] uppercase text-(--on-surface)">
								Edit Profile
							</span>
							<p className="mt-1 font-sans text-[12px] text-(--dim)">
								{profileCompletion < 100
									? `${100 - profileCompletion}% incomplete`
									: "Complete"}
							</p>
						</Link>
					</div>
				</div>

				{/* System Status */}
				<div className="flex flex-col items-center justify-between gap-4 border-t border-(--rule) pt-6 text-(--dim) md:flex-row">
					<div className="flex items-center gap-6">
						<span className="mono-label text-[10px] uppercase tracking-widest">
							System Status: Nominal
						</span>
						<div className="flex gap-1">
							<div className="h-1.5 w-1.5 bg-(--live)" />
							<div className="h-1.5 w-1.5 bg-(--live)" />
							<div className="h-1.5 w-1.5 bg-(--live)" />
						</div>
					</div>
					<span className="mono-label text-[10px] uppercase tracking-widest">
						&copy; 2024 POSTBOARD INDUSTRIAL
					</span>
				</div>
			</div>
		</div>
	);
}
