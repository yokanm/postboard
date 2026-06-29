import { Bookmark01Icon, BookmarkAddIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { VerificationBadge } from "@/shared/components/ux/VerificationBadge";
import { useAuthStore } from "@/stores";
import { useSavedJobsStore } from "@/stores/saved-jobs-store";
import type { JobSummary } from "../types";

interface JobCardProps {
	job: JobSummary;
	featured?: boolean;
}

export function JobCard({ job, featured }: JobCardProps) {
	const isSaved = useSavedJobsStore((s) => s.isSaved(job.id));
	const toggleSaved = useSavedJobsStore((s) => s.toggle);
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

	const salary =
		job.salaryMin !== null || job.salaryMax !== null
			? `${job.salaryMin !== null ? `${job.currency} ${job.salaryMin >= 1000 ? `${Math.round(job.salaryMin / 1000)}k` : job.salaryMin.toLocaleString()}` : ""}${job.salaryMin !== null && job.salaryMax !== null ? " - " : ""}${job.salaryMax !== null ? `${job.currency} ${job.salaryMax >= 1000 ? `${Math.round(job.salaryMax / 1000)}k` : job.salaryMax.toLocaleString()}` : ""}`
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

	function handleBookmark(e: React.MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		if (!isAuthenticated) return;
		toggleSaved(job.id);
	}

	return (
		<article
			className={`group relative flex cursor-pointer flex-col gap-4 border bg-(--surface-container) p-6 transition-colors hover:border-(--primary) ${featured ? "" : "border-(--rule)"} ${featured ? "" : ""}`}
			style={featured ? { borderColor: "var(--primary)" } : undefined}
		>
			{featured && (
				<div
					className="absolute left-0 top-0 h-full w-1"
					style={{
						background:
							"linear-gradient(135deg, var(--primary) 0%, #F59E0B 100%)",
					}}
				/>
			)}
			<Link
				to="/jobs/$jobId"
				params={{ jobId: job.id }}
				search={{}}
				className="flex flex-col gap-4 no-underline"
			>
				<div className="flex items-start justify-between gap-4">
					<div className="flex items-center gap-4">
						<div className="flex h-12 w-12 items-center justify-center border border-(--rule) bg-(--background)">
							{job.company.logoUrl ? (
								<img
									src={job.company.logoUrl}
									alt={`${job.company.name} logo`}
									className="h-8 w-8 object-contain opacity-80 grayscale transition-all group-hover:grayscale-0"
								/>
							) : (
								<span className="font-mono-label text-mono-label text-(--body) uppercase">
									{job.company.name.charAt(0)}
								</span>
							)}
						</div>
						<div>
							<h3 className="font-mono-label text-mono-label mb-1 text-(--dim) uppercase">
								{job.company.name}
							</h3>
							<h2 className="job-title font-ui-xl text-ui-xl text-(--on-surface) transition-colors group-hover:text-(--primary)">
								{job.title}
							</h2>
						</div>
					</div>
					{isAuthenticated && (
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
					)}
				</div>

				<div className="flex flex-wrap gap-2">
					<span className="border border-(--rule) px-2 py-1 font-mono-label text-mono-label text-(--body) uppercase">
						{job.status === "OPEN" ? "Full-Time" : job.status}
					</span>
					<span className="border border-(--rule) px-2 py-1 font-mono-label text-mono-label text-(--body) uppercase">
						{job.locationType}
					</span>
					{salary && (
						<span className="border border-(--primary)/30 bg-(--primary)/5 px-2 py-1 font-mono-label text-mono-label text-(--primary) uppercase">
							{salary}
						</span>
					)}
				</div>

				<div className="mt-2 flex items-end justify-between border-t border-(--rule) border-dashed pt-4">
					<span className="font-mono-label text-mono-label text-(--dim)">
						Posted {postedLabel}
					</span>
					{job.company.isVerified !== undefined && (
						<VerificationBadge
							status={job.company.isVerified ? "VERIFIED" : "NONE"}
							size="sm"
						/>
					)}
				</div>
			</Link>
		</article>
	);
}
