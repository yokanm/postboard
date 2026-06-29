import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { isApiRequestError } from "@/lib/api/client";
import { useDeleteJob, useJobs, useUpdateJobStatus } from "../hooks";
import type { JobStatus } from "../types";

const STATUS_BADGE: Record<
	JobStatus,
	{ bg: string; text: string; border?: string }
> = {
	OPEN: { bg: "bg-(--live-dim) bg-opacity-30", text: "text-(--live)" },
	DRAFT: {
		bg: "bg-transparent",
		text: "text-(--dim)",
		border: "border border-dashed border-(--rule)",
	},
	CLOSED: { bg: "bg-(--surface-container-high)", text: "text-(--body)" },
	EXPIRED: { bg: "bg-(--surface-container-high)", text: "text-(--dim)" },
};

export function RecruiterJobManagement() {
	const { data, isLoading, isError, error } = useJobs({ status: "" });
	const updateStatus = useUpdateJobStatus();
	const deleteMutation = useDeleteJob();
	const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

	const jobs = data?.jobs ?? [];

	function handleStatusToggle(jobId: string, currentStatus: JobStatus) {
		if (currentStatus === "OPEN") {
			updateStatus.mutate({ id: jobId, input: { status: "CLOSED" } });
		} else if (currentStatus === "DRAFT" || currentStatus === "CLOSED") {
			updateStatus.mutate({ id: jobId, input: { status: "OPEN" } });
		}
	}

	function handleDelete() {
		if (!deleteTarget) return;
		deleteMutation.mutate(deleteTarget, {
			onSuccess: () => setDeleteTarget(null),
		});
	}

	return (
		<div className="flex flex-col gap-6">
			<header className="flex items-start justify-between gap-4">
				<div className="flex flex-col gap-1">
					<span className="mono-label text-(--primary-container)">
						// JOB_MANAGEMENT
					</span>
					<h1 className="font-headline m-0 text-(--on-surface)">
						Job Management
					</h1>
					<p className="font-body m-0 text-(--body)">
						Manage your company&apos;s job listings.
					</p>
				</div>
				<Link
					to="/recruiter/jobs/create"
					className="mono-label inline-flex shrink-0 items-center gap-2 border border-(--primary-container) bg-(--primary-container) px-4 py-2 uppercase tracking-[0.05em] text-(--on-primary-container) no-underline transition-colors duration-150 hover:bg-(--primary)"
				>
					+ New Job
				</Link>
			</header>

			{isLoading && (
				<div className="flex flex-col gap-px">
					{[1, 2, 3, 4, 5].map((i) => (
						<Skeleton key={i} className="h-16 w-full rounded-none" />
					))}
				</div>
			)}

			{isError && (
				<div className="border border-(--error-container) bg-(--error-container) bg-opacity-10 p-4">
					<p className="m-0 font-sans text-[14px] text-(--error)">
						{(error as Error)?.message ?? "Failed to load jobs."}
					</p>
				</div>
			)}

			{!isLoading && !isError && jobs.length === 0 && (
				<div className="flex flex-col items-center gap-3 border border-(--rule) p-8">
					<span className="mono-label text-(--dim)">NO_JOBS_POSTED</span>
					<p className="m-0 max-w-[320px] text-center font-sans text-[14px] text-(--body)">
						You haven&apos;t posted any jobs yet. Create your first listing.
					</p>
					<Link
						to="/recruiter/jobs/create"
						className="mono-label mt-2 border border-(--primary-container) bg-(--primary-container) px-4 py-2 uppercase tracking-[0.05em] text-(--on-primary-container) no-underline transition-colors duration-150 hover:bg-(--primary)"
					>
						Create Job
					</Link>
				</div>
			)}

			{!isLoading && !isError && jobs.length > 0 && (
				<div className="overflow-x-auto border border-(--rule)">
					<table className="w-full border-collapse">
						<thead>
							<tr className="border-b border-(--rule) bg-(--surface-container-low)">
								<th className="mono-label px-3 py-2 text-left text-(--dim) uppercase">
									Title
								</th>
								<th className="mono-label px-3 py-2 text-left text-(--dim) uppercase">
									Status
								</th>
								<th className="mono-label px-3 py-2 text-left text-(--dim) uppercase">
									Level
								</th>
								<th className="mono-label px-3 py-2 text-left text-(--dim) uppercase">
									Type
								</th>
								<th className="mono-label px-3 py-2 text-left text-(--dim) uppercase">
									Applicants
								</th>
								<th className="mono-label px-3 py-2 text-left text-(--dim) uppercase">
									Posted
								</th>
								<th className="mono-label px-3 py-2 text-center text-(--dim) uppercase">
									Actions
								</th>
							</tr>
						</thead>
						<tbody>
							{jobs.map((job) => {
								const badge = STATUS_BADGE[job.status];
								return (
									<tr
										key={job.id}
										className="border-b border-(--rule) transition-colors duration-150 hover:bg-(--surface-container-low)"
									>
										<td className="px-3 py-3">
											<Link
												to="/recruiter/jobs/$jobId"
												params={{ jobId: job.id }}
												className="font-sans text-[14px] font-medium text-(--on-surface) no-underline transition-colors duration-150 hover:text-(--primary-container)"
											>
												{job.title}
											</Link>
											{job.company.name && (
												<p className="mono-label m-0 text-(--dim)">
													{job.company.name}
												</p>
											)}
										</td>
										<td className="px-3 py-3">
											<span
												className={`mono-label inline-block rounded-[2px] px-2 py-0.5 ${badge.bg} ${badge.text} ${badge.border ?? ""}`}
											>
												{job.status}
											</span>
										</td>
										<td className="mono-label px-3 py-3 text-(--body)">
											{job.experienceLevel}
										</td>
										<td className="mono-label px-3 py-3 text-(--body)">
											{job.locationType}
										</td>
										<td className="mono-label px-3 py-3 text-(--body)">
											{job._count?.applications ?? 0}
										</td>
										<td className="mono-label px-3 py-3 text-(--dim)">
											{new Date(job.createdAt).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
											})}
										</td>
										<td className="px-3 py-3">
											<div className="flex items-center justify-center gap-2">
												<Link
													to="/recruiter/jobs/$jobId"
													params={{ jobId: job.id }}
													className="mono-label text-(--primary-container) no-underline transition-colors duration-150 hover:text-(--primary)"
												>
													VIEW
												</Link>
												<Link
													to="/recruiter/jobs/$jobId/edit"
													params={{ jobId: job.id }}
													className="mono-label text-(--body) no-underline transition-colors duration-150 hover:text-(--on-surface)"
												>
													EDIT
												</Link>
												<button
													type="button"
													onClick={() => handleStatusToggle(job.id, job.status)}
													disabled={updateStatus.isPending}
													className="mono-label cursor-pointer bg-transparent text-(--body) no-underline transition-colors duration-150 hover:text-(--on-surface) disabled:opacity-50"
												>
													{job.status === "OPEN" ? "CLOSE" : "REOPEN"}
												</button>
												<button
													type="button"
													onClick={() => setDeleteTarget(job.id)}
													className="mono-label cursor-pointer bg-transparent text-(--error) no-underline transition-colors duration-150 hover:text-(--destructive) disabled:opacity-50"
												>
													DELETE
												</button>
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}

			<Dialog
				open={!!deleteTarget}
				onOpenChange={(open) => !open && setDeleteTarget(null)}
			>
				<DialogContent className="max-w-[400px] rounded-none border-(--rule) bg-(--surface) p-0">
					<DialogHeader className="border-b border-(--rule) px-5 py-4">
						<DialogTitle className="font-sans text-[15px] font-semibold text-(--on-surface)">
							Delete Job
						</DialogTitle>
					</DialogHeader>
					<div className="flex flex-col gap-4 px-5 py-4">
						<p className="m-0 font-sans text-[14px] text-(--body)">
							Are you sure you want to delete this job? This action cannot be
							undone.
						</p>
						{deleteMutation.isError && (
							<p className="m-0 font-sans text-[12px] text-(--error)">
								{isApiRequestError(deleteMutation.error)
									? deleteMutation.error.message
									: "Failed to delete."}
							</p>
						)}
						<div className="flex justify-end gap-3">
							<button
								type="button"
								onClick={() => setDeleteTarget(null)}
								className="mono-label cursor-pointer border border-(--rule) bg-transparent px-4 py-2 uppercase tracking-[0.05em] text-(--dim) transition-colors duration-150 hover:border-(--on-surface) hover:text-(--on-surface)"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={handleDelete}
								disabled={deleteMutation.isPending}
								className="mono-label cursor-pointer border border-(--error) bg-(--error) px-4 py-2 uppercase tracking-[0.05em] text-(--on-error) transition-colors duration-150 hover:opacity-90 disabled:opacity-50"
							>
								{deleteMutation.isPending ? "DELETING..." : "DELETE"}
							</button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
