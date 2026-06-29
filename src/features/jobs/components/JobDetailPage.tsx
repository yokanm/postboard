import {
	Bookmark01Icon,
	BookmarkAddIcon,
	CheckmarkCircle01Icon,
	Share07Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMyApplications } from "@/features/applications/hooks";
import { ErrorState } from "@/shared/components/ux/ErrorState";
import { LoadingState } from "@/shared/components/ux/LoadingState";
import { useAuthStore } from "@/stores";
import { useSavedJobsStore } from "@/stores/saved-jobs-store";
import { useCompanyJobs, useJob } from "../hooks";
import { ApplyModal } from "./ApplyModal";
import { JobDetailMobileBar } from "./JobDetailMobileBar";

interface JobDetailPageProps {
	jobId: string;
}

export function JobDetailPage({ jobId }: JobDetailPageProps) {
	const { data: job, isLoading, isError, error } = useJob(jobId);
	const { data: similarRoles } = useCompanyJobs(job?.company.id ?? "", jobId);
	const role = useAuthStore((s) => s.role);
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
	const isSaved = useSavedJobsStore((s) => s.isSaved(jobId));
	const toggleSaved = useSavedJobsStore((s) => s.toggle);
	const { data: myApps } = useMyApplications();
	const [applyOpen, setApplyOpen] = useState(false);
	const [shareCopied, setShareCopied] = useState(false);
	const isCandidate = role === "CANDIDATE";
	const hasApplied =
		myApps?.applications?.some((a) => a.job.id === jobId) ?? false;

	async function handleShare() {
		try {
			await navigator.clipboard.writeText(window.location.href);
			setShareCopied(true);
			setTimeout(() => setShareCopied(false), 2000);
		} catch {}
	}

	function handleBookmark() {
		if (!isAuthenticated) return;
		toggleSaved(jobId);
	}

	if (isLoading) {
		return (
			<div className="mx-auto w-full max-w-(--max-width) flex-1 px-(--margin) py-12">
				<LoadingState variant="skeleton" count={6} />
			</div>
		);
	}

	if (isError || !job) {
		return (
			<div
				className="mx-auto w-full max-w-(--max-width) flex-1 px-(--margin) py-12"
				role="alert"
				aria-live="assertive"
			>
				<ErrorState message={(error as Error)?.message ?? "Job not found."} />
				<Link
					to="/jobs"
					search={{}}
					className="mono-label mt-4 inline-flex items-center gap-2 text-(--primary-container) no-underline transition-colors hover:text-(--primary)"
				>
					&larr; Back to Jobs
				</Link>
			</div>
		);
	}

	const salary =
		job.salaryMin !== null || job.salaryMax !== null
			? `${job.salaryMin !== null ? `${job.currency} ${Math.round(job.salaryMin / 1000)}k` : ""}${job.salaryMin !== null && job.salaryMax !== null ? "–" : ""}${job.salaryMax !== null ? `${job.currency} ${Math.round(job.salaryMax / 1000)}k` : ""}`
			: null;

	const postedDays = Math.floor(
		(Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24),
	);
	const postedLabel =
		postedDays === 0
			? "Today"
			: postedDays === 1
				? "1 day ago"
				: `${postedDays} days ago`;

	const descriptionParagraphs = job.description
		.split("\n")
		.map((p) => p.trim())
		.filter(Boolean);

	return (
		<>
			<main className="mx-auto w-full max-w-(--max-width) flex-1 px-(--margin) py-12 md:pb-12 pb-40">
				<div className="grid grid-cols-1 items-start gap-(--gutter) md:grid-cols-12">
					<div className="flex flex-col gap-12 md:col-span-8">
						<section className="flex flex-col gap-6">
							<Link
								to="/jobs"
								search={{}}
								className="mono-label group flex items-center gap-2 text-(--dim) no-underline transition-colors hover:text-(--on-surface)"
							>
								<span className="transition-transform group-hover:-translate-x-1">
									&larr;
								</span>{" "}
								ALL ROLES
							</Link>
							<div className="flex flex-col gap-2">
								<h1 className="font-headline-2xl text-[40px] leading-tight text-(--on-surface)">
									{job.title}
								</h1>
								<div className="flex flex-wrap items-center gap-x-4 gap-y-2">
									<Link
										to="/companies/$companyId"
										params={{ companyId: job.company.id }}
										className="font-ui-lg text-(--primary-container) no-underline transition-colors hover:text-(--primary)"
									>
										{job.company.name}
									</Link>
									{job.location && (
										<>
											<span className="text-(--dim)">&bull;</span>
											<span className="font-body-base text-(--body)">
												{job.location}
											</span>
										</>
									)}
								</div>
							</div>
							<div className="flex flex-wrap gap-2">
								<span className="border border-(--live)/20 bg-(--live-dim) px-3 py-1 font-mono-label text-[11px] uppercase text-(--live)">
									{job.status}
								</span>
								<span className="border border-(--rule) bg-(--surface-container-high) px-3 py-1 font-mono-label text-[11px] uppercase text-(--on-surface)">
									{job.locationType}
								</span>
								{job.experienceLevel && (
									<span className="border border-(--rule) bg-(--surface-container-high) px-3 py-1 font-mono-label text-[11px] uppercase text-(--on-surface)">
										{job.experienceLevel}
									</span>
								)}
								{salary && (
									<span className="border border-(--rule) bg-(--surface-container-high) px-3 py-1 font-mono-label text-[11px] uppercase text-(--on-surface)">
										{salary}
									</span>
								)}
							</div>
						</section>

						<hr className="border-(--rule)" />

						<section className="flex flex-col gap-4">
							<div className="mono-label text-(--dim) uppercase">
								// about_the_role
							</div>
							<div className="max-w-[640px] space-y-4 font-body-base text-body-base text-(--body)">
								{descriptionParagraphs.length > 0 ? (
									descriptionParagraphs.map((p, i) => <p key={i}>{p}</p>)
								) : (
									<p>{job.description}</p>
								)}
							</div>
						</section>

						<div className="press-grid-lines relative h-64 overflow-hidden border border-(--rule)">
							<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
								<div className="mono-label text-(--dim) uppercase tracking-[0.5em]">
									VISUALIZING PROTOCOL TOPOLOGY
								</div>
							</div>
						</div>
					</div>

					<aside className="sticky top-24 flex flex-col gap-6 md:col-span-4">
						<div className="flex flex-col gap-6 border border-(--rule) bg-(--surface-container-lowest) p-6">
							<button
								type="button"
								onClick={handleShare}
								className="mono-label flex cursor-pointer items-center justify-center gap-2 border border-(--rule) bg-(--surface-container-low) px-3 py-2 text-[11px] uppercase tracking-[0.05em] text-(--dim) transition-colors hover:border-(--on-surface) hover:text-(--on-surface)"
							>
								<HugeiconsIcon
									icon={Share07Icon}
									strokeWidth={2}
									className="h-4 w-4"
								/>
								{shareCopied ? "Copied!" : "Share"}
							</button>
							<div className="flex items-center justify-between border-t border-(--rule) pt-4">
								<span className="mono-label text-[11px] uppercase text-(--dim)">
									Save
								</span>
								<button
									type="button"
									onClick={handleBookmark}
									className="cursor-pointer text-(--dim) transition-colors hover:text-(--primary)"
									aria-label={isSaved ? "Remove from saved jobs" : "Save job"}
								>
									<HugeiconsIcon
										icon={isSaved ? BookmarkAddIcon : Bookmark01Icon}
										strokeWidth={2}
										className="h-5 w-5"
									/>
								</button>
							</div>
							{isCandidate && job.status === "OPEN" && !hasApplied && (
								<button
									type="button"
									onClick={() => setApplyOpen(true)}
									aria-label={`Apply to ${job.title}`}
									className="w-full bg-(--primary-container) px-6 py-4 font-mono-label text-mono-label font-bold uppercase tracking-widest text-(--on-primary-container) transition-all hover:brightness-110 active:scale-95"
								>
									Apply Now
								</button>
							)}
							{isCandidate && hasApplied && (
								<div
									className="flex w-full items-center justify-center gap-2 border border-(--live)/30 bg-(--live-dim)/10 px-6 py-4"
									role="status"
									aria-live="polite"
								>
									<HugeiconsIcon
										icon={CheckmarkCircle01Icon}
										strokeWidth={2}
										className="h-5 w-5 text-(--live)"
									/>
									<span className="font-mono-label text-mono-label font-bold uppercase tracking-widest text-(--live)">
										Applied
									</span>
								</div>
							)}
							<div className="grid grid-cols-2 gap-4 border-t border-(--rule) pt-6">
								<div>
									<div className="mono-label mb-1 text-[11px] uppercase text-(--dim)">
										Posted
									</div>
									<div className="font-ui-sm text-(--on-surface)">
										{postedLabel}
									</div>
								</div>
								<div>
									<div className="mono-label mb-1 text-[11px] uppercase text-(--dim)">
										Expires
									</div>
									<div className="font-ui-sm text-(--on-surface)">
										{job.expiresAt
											? new Date(job.expiresAt).toLocaleDateString("en-US", {
													month: "short",
													day: "numeric",
													year: "numeric",
												})
											: "Ongoing"}
									</div>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<div className="mono-label mb-1 text-[11px] uppercase text-(--dim)">
										Level
									</div>
									<div className="font-ui-sm text-(--on-surface)">
										{job.experienceLevel}
									</div>
								</div>
								<div>
									<div className="mono-label mb-1 text-[11px] uppercase text-(--dim)">
										Location
									</div>
									<div className="font-ui-sm text-(--on-surface)">
										{job.locationType}
									</div>
								</div>
							</div>
						</div>

						<div className="border border-(--rule) bg-(--surface-container-lowest) p-6">
							<div className="mb-6 flex items-center gap-4">
								<div className="flex h-12 w-12 items-center justify-center overflow-hidden border border-(--rule) bg-(--surface-container-high)">
									{job.company.logoUrl ? (
										<img
											src={job.company.logoUrl}
											alt={`${job.company.name} logo`}
											className="h-full w-full object-contain grayscale"
										/>
									) : (
										<span className="mono-label text-(--dim) uppercase">
											{job.company.name.charAt(0)}
										</span>
									)}
								</div>
								<div>
									<div className="font-ui-lg text-(--on-surface)">
										{job.company.name}
									</div>
									{job.location && (
										<div className="mono-label text-[11px] uppercase text-(--dim)">
											{job.location}
										</div>
									)}
								</div>
							</div>
							{job.company.industry && (
								<div className="flex justify-between border-b border-(--rule)/50 pb-2 font-ui-sm">
									<span className="text-(--dim)">Industry</span>
									<span className="text-(--on-surface)">
										{job.company.industry}
									</span>
								</div>
							)}
							{job.company.website && (
								<div className="flex justify-between border-b border-(--rule)/50 pb-2 pt-2 font-ui-sm">
									<span className="text-(--dim)">Website</span>
									<a
										href={job.company.website}
										target="_blank"
										rel="noopener noreferrer"
										className="text-(--primary-container) no-underline transition-colors hover:text-(--primary)"
									>
										{new URL(job.company.website).hostname}
									</a>
								</div>
							)}
							<Link
								to="/companies/$companyId"
								params={{ companyId: job.company.id }}
								className="mt-6 block text-center font-mono-label text-mono-label text-(--primary-container) uppercase no-underline transition-colors hover:text-(--primary)"
							>
								View Company Profile
							</Link>
						</div>

						{similarRoles && similarRoles.length > 0 && (
							<div className="flex flex-col gap-4">
								<div className="mono-label px-2 text-[11px] uppercase text-(--dim)">
									// similar_roles
								</div>
								<div className="flex flex-col gap-2">
									{similarRoles.map((sr) => (
										<Link
											key={sr.id}
											to="/jobs/$jobId"
											params={{ jobId: sr.id }}
											className="group border border-(--rule) bg-(--surface-container-low) p-4 font-mono-label transition-colors hover:border-(--primary-container)"
										>
											<div className="mono-label text-[11px] uppercase text-(--on-surface) transition-colors group-hover:text-(--primary-container)">
												{sr.title}
											</div>
											<div className="mono-label text-[9px] text-(--dim)">
												{sr.company.name}
												{sr.salaryMin !== null
													? ` / ${sr.currency} ${Math.round(sr.salaryMin / 1000)}k+`
													: ""}
											</div>
										</Link>
									))}
								</div>
							</div>
						)}
					</aside>
				</div>
			</main>

			<JobDetailMobileBar
				onShare={handleShare}
				shareCopied={shareCopied}
				isSaved={isSaved}
				onBookmark={handleBookmark}
				isAuthenticated={isAuthenticated}
				isCandidate={isCandidate}
				jobOpen={job.status === "OPEN"}
				hasApplied={hasApplied}
				onApply={() => setApplyOpen(true)}
			/>

			<ApplyModal
				jobId={job.id}
				jobTitle={job.title}
				open={applyOpen}
				onOpenChange={setApplyOpen}
			/>
		</>
	);
}
