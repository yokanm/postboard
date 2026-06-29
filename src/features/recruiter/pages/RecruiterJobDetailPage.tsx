import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useJobApplications } from "@/features/applications/hooks";
import { useJob, useUpdateJobStatus } from "@/features/jobs/hooks";
import type { JobStatus } from "@/features/jobs/types";
import { StatusBadge } from "@/shared/components/recruiter/StatusBadge";
import { ErrorState } from "@/shared/components/ux/ErrorState";

interface RecruiterJobDetailPageProps {
	jobId: string;
}

export function RecruiterJobDetailPage({ jobId }: RecruiterJobDetailPageProps) {
	const { data: job, isLoading, isError, error } = useJob(jobId);
	const { data: appsData } = useJobApplications(jobId);
	const updateStatus = useUpdateJobStatus();
	const [statusUpdating, setStatusUpdating] = useState(false);

	const applications = appsData?.applications ?? [];
	const pendingApps = applications.filter((a) => a.status === "PENDING");
	const reviewedApps = applications.filter((a) => a.status === "REVIEWED");

	async function handleStatusToggle(currentStatus: JobStatus) {
		setStatusUpdating(true);
		try {
			if (currentStatus === "OPEN") {
				updateStatus.mutate({ id: jobId, input: { status: "CLOSED" } });
			} else if (currentStatus === "DRAFT" || currentStatus === "CLOSED") {
				updateStatus.mutate({ id: jobId, input: { status: "OPEN" } });
			}
		} finally {
			setStatusUpdating(false);
		}
	}

	if (isLoading) {
		return (
			<div className="flex flex-col gap-4">
				<Skeleton className="h-8 w-64 bg-(--surface-container-low)" />
				<Skeleton className="h-4 w-96 bg-(--surface-container-low)" />
				<Skeleton className="mt-4 h-48 w-full bg-(--surface-container-low)" />
			</div>
		);
	}

	if (isError || !job) {
		return (
			<ErrorState message={(error as Error)?.message ?? "Job not found"} />
		);
	}

	const postedDate = new Date(job.createdAt).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});

	const salary =
		job.salaryMin !== null || job.salaryMax !== null
			? `${job.salaryMin !== null ? `${job.currency} ${job.salaryMin.toLocaleString()}` : ""}${job.salaryMin !== null && job.salaryMax !== null ? " – " : ""}${job.salaryMax !== null ? `${job.currency} ${job.salaryMax.toLocaleString()}` : ""}`
			: null;

	return (
		<div className="flex flex-col gap-6">
			<Link
				to="/recruiter/jobs"
				className="mono-label inline-flex items-center gap-2 text-(--dim) no-underline transition-colors hover:text-(--on-surface)"
			>
				&larr; Back to My Jobs
			</Link>

			<div className="flex items-start justify-between">
				<div>
					<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--primary-container)">
						// JOB_DETAIL
					</span>
					<h1 className="font-headline mt-2 text-xl text-(--on-surface)">
						{job.title}
					</h1>
				</div>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => handleStatusToggle(job.status)}
						disabled={updateStatus.isPending || statusUpdating}
						className="mono-label cursor-pointer border border-(--rule) bg-(--surface-container-low) px-4 py-2 text-[11px] uppercase tracking-[0.05em] text-(--dim) transition-colors hover:border-(--on-surface) hover:text-(--on-surface) disabled:opacity-50"
					>
						{job.status === "OPEN"
							? "Close"
							: job.status === "DRAFT"
								? "Publish"
								: "Reopen"}
					</button>
					<Link
						to="/recruiter/jobs/$jobId/edit"
						params={{ jobId }}
						className="mono-label inline-flex items-center border border-(--primary-container) bg-(--primary-container) px-4 py-2 text-[11px] uppercase tracking-[0.05em] text-(--on-primary-container) no-underline transition-colors hover:bg-(--primary)"
					>
						Edit
					</Link>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<div className="border border-(--rule) p-4">
					<span className="mono-label text-[10px] uppercase tracking-[0.05em] text-(--dim)">
						STATUS
					</span>
					<div className="mt-1">
						<StatusBadge status={job.status} />
					</div>
				</div>
				<div className="border border-(--rule) p-4">
					<span className="mono-label text-[10px] uppercase tracking-[0.05em] text-(--dim)">
						APPLICATIONS
					</span>
					<p className="mt-1 font-serif text-2xl text-(--on-surface)">
						{applications.length}
					</p>
				</div>
				<div className="border border-(--rule) p-4">
					<span className="mono-label text-[10px] uppercase tracking-[0.05em] text-(--dim)">
						PENDING REVIEW
					</span>
					<p className="mt-1 font-serif text-2xl text-(--amber)">
						{pendingApps.length}
					</p>
				</div>
				<div className="border border-(--rule) p-4">
					<span className="mono-label text-[10px] uppercase tracking-[0.05em] text-(--dim)">
						SHORTLISTED
					</span>
					<p className="mt-1 font-serif text-2xl text-(--primary-container)">
						{reviewedApps.length}
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
				<div className="flex flex-col gap-4">
					<section className="border border-(--rule) p-4">
						<h2 className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
							DESCRIPTION
						</h2>
						<p className="mt-3 whitespace-pre-wrap font-sans text-[14px] leading-[1.7] text-(--body)">
							{job.description}
						</p>
					</section>

					{applications.length > 0 && (
						<section className="border border-(--rule)">
							<div className="flex items-center justify-between border-b border-(--rule) px-4 py-3">
								<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
									RECENT APPLICANTS
								</span>
								<Link
									to="/recruiter/jobs/$jobId/applications"
									params={{ jobId }}
									className="mono-label text-[11px] text-(--primary-container) no-underline hover:underline"
								>
									View all &rarr;
								</Link>
							</div>
							{applications.slice(0, 5).map((app) => (
								<Link
									key={app.id}
									to="/recruiter/applications/$applicationId"
									params={{ applicationId: app.id }}
									search={{ jobId }}
									className="flex items-center justify-between border-b border-(--rule) px-4 py-3 transition-colors hover:bg-(--surface-container-low)"
								>
									<div>
										<p className="font-sans text-[13px] text-(--on-surface)">
											{app.user.firstName} {app.user.lastName}
										</p>
										<p className="font-sans text-[12px] text-(--dim)">
											Applied{" "}
											{new Date(app.createdAt).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
											})}
										</p>
									</div>
									<StatusBadge status={app.status} />
								</Link>
							))}
						</section>
					)}
				</div>

				<aside className="flex flex-col gap-4">
					<div className="border border-(--rule) p-4">
						<h2 className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
							DETAILS
						</h2>
						<div className="mt-3 flex flex-col gap-2">
							<div className="flex justify-between">
								<span className="mono-label text-[11px] text-(--dim)">
									TYPE
								</span>
								<span className="mono-label text-[11px] text-(--body)">
									{job.locationType}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="mono-label text-[11px] text-(--dim)">
									LEVEL
								</span>
								<span className="mono-label text-[11px] text-(--body)">
									{job.experienceLevel}
								</span>
							</div>
							{job.location && (
								<div className="flex justify-between">
									<span className="mono-label text-[11px] text-(--dim)">
										LOCATION
									</span>
									<span className="mono-label text-[11px] text-(--body)">
										{job.location}
									</span>
								</div>
							)}
							{salary && (
								<div className="flex justify-between">
									<span className="mono-label text-[11px] text-(--dim)">
										SALARY
									</span>
									<span className="mono-label text-[11px] text-(--body)">
										{salary}
									</span>
								</div>
							)}
							<div className="flex justify-between">
								<span className="mono-label text-[11px] text-(--dim)">
									POSTED
								</span>
								<span className="mono-label text-[11px] text-(--body)">
									{postedDate}
								</span>
							</div>
						</div>
					</div>

					{job.tags.length > 0 && (
						<div className="border border-(--rule) p-4">
							<h2 className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
								TAGS
							</h2>
							<div className="mt-3 flex flex-wrap gap-1.5">
								{job.tags.map((t) => (
									<span
										key={t.tag.slug}
										className="mono-label rounded-[2px] bg-(--surface-container-high) px-2 py-1 text-[11px] text-(--body)"
									>
										{t.tag.name}
									</span>
								))}
							</div>
						</div>
					)}

					<div className="border border-(--rule) p-4">
						<h2 className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
							COMPANY
						</h2>
						<p className="mt-2 font-sans text-[14px] font-semibold text-(--on-surface)">
							{job.company.name}
						</p>
						{job.company.industry && (
							<p className="mono-label text-[11px] text-(--dim)">
								{job.company.industry}
							</p>
						)}
					</div>
				</aside>
			</div>
		</div>
	);
}
