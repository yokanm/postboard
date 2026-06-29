import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getJobApplications } from "@/features/applications/api";
import { ApplicationStatusBadge } from "@/features/applications/components/ApplicationStatusBadge";
import { ApplicationTimeline } from "@/features/applications/components/ApplicationTimeline";
import {
	useJobApplications,
	useUpdateApplicationStatus,
} from "@/features/applications/hooks";
import type { ApplicationStatus } from "@/features/applications/types";
import {
	getValidTransitions,
	isTerminalStatus,
} from "@/features/applications/utils/application-status";
import { listJobs } from "@/features/jobs/api";
import { useJob } from "@/features/jobs/hooks";
import { ConfirmDialog } from "@/shared/components/dialogs/ConfirmDialog";
import { ErrorState } from "@/shared/components/ux/ErrorState";

interface RecruiterApplicationDetailPageProps {
	applicationId: string;
	jobId?: string;
}

export function RecruiterApplicationDetailPage({
	applicationId,
	jobId: explicitJobId,
}: RecruiterApplicationDetailPageProps) {
	const [statusTarget, setStatusTarget] = useState<ApplicationStatus | null>(
		null,
	);
	const [rejectionReason, setRejectionReason] = useState("");

	const updateStatus = useUpdateApplicationStatus();

	const { data: discovered } = useQuery({
		queryKey: ["discover", "application", applicationId],
		queryFn: async () => {
			const jobsResp = await listJobs({ limit: "100" });
			for (const job of jobsResp.jobs) {
				if ((job._count?.applications ?? 0) > 0) {
					const appsResp = await getJobApplications(job.id, { limit: "100" });
					const found = appsResp.applications.find(
						(a) => a.id === applicationId,
					);
					if (found) return { jobId: job.id };
				}
			}
			return null;
		},
		enabled: !explicitJobId,
		staleTime: 1000 * 60 * 5,
	});

	const resolvedJobId = explicitJobId ?? discovered?.jobId;

	const { data: appsData } = useJobApplications(resolvedJobId ?? "");

	const applications = appsData?.applications ?? [];
	const application = applications.find((a) => a.id === applicationId);

	const { data: job } = useJob(application?.jobId ?? "");

	const isLoading =
		!resolvedJobId && explicitJobId === undefined && discovered === undefined;

	async function handleStatusConfirm() {
		if (!statusTarget || !application) return;
		updateStatus.mutate(
			{
				applicationId: application.id,
				input: {
					status: statusTarget,
					rejectionReason:
						statusTarget === "REJECTED" ? rejectionReason : undefined,
				},
			},
			{
				onSuccess: () => {
					setStatusTarget(null);
					setRejectionReason("");
				},
			},
		);
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

	if (!application) {
		return <ErrorState message="Application not found" />;
	}

	const transitions = getValidTransitions(
		application.status as ApplicationStatus,
	);
	const isTerminal = isTerminalStatus(application.status);
	const profile = application.user.profile;

	return (
		<div className="flex flex-col gap-6">
			<Link
				to={
					job?.id
						? ("/recruiter/jobs/$jobId/applications" as const)
						: ("/recruiter/jobs" as const)
				}
				params={job?.id ? { jobId: job.id } : undefined}
				className="mono-label inline-flex items-center gap-2 text-(--dim) no-underline transition-colors hover:text-(--on-surface)"
			>
				&larr; Back to Applications
			</Link>

			<div className="flex items-start justify-between">
				<div>
					<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--primary-container)">
						// APPLICATION_DETAIL
					</span>
					<h1 className="font-headline mt-2 text-xl text-(--on-surface)">
						{application.user.firstName} {application.user.lastName}
					</h1>
					{job && (
						<p className="mt-1 font-sans text-[13px] text-(--body)">
							Applied for{" "}
							<Link
								to="/recruiter/jobs/$jobId"
								params={{ jobId: job.id }}
								className="text-(--primary-container) no-underline hover:underline"
							>
								{job.title}
							</Link>
						</p>
					)}
				</div>
				{!isTerminal && transitions.length > 0 && (
					<div className="flex gap-2">
						{transitions.map((status) => (
							<button
								key={status}
								type="button"
								onClick={() => setStatusTarget(status)}
								className={`mono-label cursor-pointer border px-4 py-2 text-[11px] uppercase tracking-[0.05em] transition-colors disabled:opacity-50 ${
									status === "REJECTED"
										? "border-(--error) text-(--error) hover:bg-(--error)/10"
										: "border-(--primary-container) bg-(--primary-container) text-(--on-primary-container) hover:bg-(--primary)"
								}`}
							>
								{status === "REVIEWED"
									? "Mark Reviewed"
									: status === "SHORTLISTED"
										? "Shortlist"
										: status === "ACCEPTED"
											? "Accept"
											: status}
							</button>
						))}
					</div>
				)}
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
				<div className="flex flex-col gap-4">
					<div className="border border-(--rule) p-4">
						<div className="flex items-center justify-between">
							<h2 className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
								CANDIDATE INFO
							</h2>
							<ApplicationStatusBadge status={application.status} />
						</div>
						<div className="mt-4 flex flex-col gap-3">
							<div>
								<span className="mono-label text-[10px] uppercase text-(--dim)">
									Name
								</span>
								<p className="font-sans text-[14px] text-(--on-surface)">
									{application.user.firstName} {application.user.lastName}
								</p>
							</div>
							<div>
								<span className="mono-label text-[10px] uppercase text-(--dim)">
									Email
								</span>
								<p className="font-sans text-[14px] text-(--on-surface)">
									{application.user.email}
								</p>
							</div>
							<div>
								<span className="mono-label text-[10px] uppercase text-(--dim)">
									Username
								</span>
								<p className="font-sans text-[14px] text-(--on-surface)">
									@{application.user.userName}
								</p>
							</div>
							{profile?.location && (
								<div>
									<span className="mono-label text-[10px] uppercase text-(--dim)">
										Location
									</span>
									<p className="font-sans text-[14px] text-(--on-surface)">
										{profile.location}
									</p>
								</div>
							)}
							{profile?.skills && profile.skills.length > 0 && (
								<div>
									<span className="mono-label text-[10px] uppercase text-(--dim)">
										Skills
									</span>
									<div className="mt-1 flex flex-wrap gap-1.5">
										{profile.skills.map((skill) => (
											<span
												key={skill}
												className="mono-label rounded-[2px] bg-(--surface-container-high) px-2 py-0.5 text-[11px] text-(--body)"
											>
												{skill}
											</span>
										))}
									</div>
								</div>
							)}
						</div>
					</div>

					{application.coverLetter && (
						<div className="border border-(--rule) p-4">
							<h2 className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
								COVER LETTER
							</h2>
							<p className="mt-3 whitespace-pre-wrap font-sans text-[14px] leading-[1.7] text-(--body)">
								{application.coverLetter}
							</p>
						</div>
					)}

					{application.resumeUrl && (
						<div className="border border-(--rule) p-4">
							<h2 className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
								RESUME
							</h2>
							<a
								href={application.resumeUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="mono-label mt-2 inline-flex items-center gap-2 text-(--primary-container) no-underline transition-colors hover:text-(--primary)"
							>
								View Resume &rarr;
							</a>
						</div>
					)}
				</div>

				<aside className="flex flex-col gap-4">
					<div className="border border-(--rule) p-4">
						<h2 className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
							TIMELINE
						</h2>
						<div className="mt-3">
							<ApplicationTimeline currentStatus={application.status} />
						</div>
					</div>

					<div className="border border-(--rule) p-4">
						<h2 className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
							DETAILS
						</h2>
						<div className="mt-3 flex flex-col gap-2">
							<div className="flex justify-between">
								<span className="mono-label text-[10px] text-(--dim)">
									APPLIED
								</span>
								<span className="font-sans text-[12px] text-(--on-surface)">
									{new Date(application.createdAt).toLocaleDateString("en-US", {
										month: "short",
										day: "numeric",
										year: "numeric",
									})}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="mono-label text-[10px] text-(--dim)">
									UPDATED
								</span>
								<span className="font-sans text-[12px] text-(--on-surface)">
									{new Date(application.updatedAt).toLocaleDateString("en-US", {
										month: "short",
										day: "numeric",
									})}
								</span>
							</div>
						</div>
					</div>

					{application.rejectionReason && (
						<div className="border border-(--error) p-4">
							<h2 className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--error)">
								REJECTION REASON
							</h2>
							<p className="mt-2 font-sans text-[13px] text-(--body)">
								{application.rejectionReason}
							</p>
						</div>
					)}
				</aside>
			</div>

			<ConfirmDialog
				open={statusTarget !== null}
				onOpenChange={(open) => {
					if (!open) {
						setStatusTarget(null);
						setRejectionReason("");
					}
				}}
				title={
					statusTarget === "REJECTED"
						? "Reject Application"
						: statusTarget === "ACCEPTED"
							? "Accept Application"
							: "Update Status"
				}
				description={
					statusTarget === "REJECTED"
						? "This will move the application to Rejected."
						: statusTarget === "ACCEPTED"
							? "This will mark the candidate as hired."
							: `Move to ${statusTarget?.toLowerCase() ?? ""}?`
				}
				confirmLabel={
					statusTarget === "REJECTED"
						? "Reject"
						: statusTarget === "ACCEPTED"
							? "Accept"
							: "Confirm"
				}
				variant={statusTarget === "REJECTED" ? "danger" : "default"}
				onConfirm={handleStatusConfirm}
				isLoading={updateStatus.isPending}
			/>

			{statusTarget === "REJECTED" && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-(--ink)/60 p-4">
					<div className="w-full max-w-[400px] border border-(--rule) bg-(--surface) shadow-xl">
						<div className="border-b border-(--rule) px-5 py-4">
							<h2 className="font-sans text-[15px] font-semibold text-(--on-surface)">
								Rejection Reason
							</h2>
						</div>
						<div className="flex flex-col gap-4 px-5 py-4">
							<textarea
								value={rejectionReason}
								onChange={(e) => setRejectionReason(e.target.value)}
								placeholder="Provide feedback for the candidate (optional)..."
								rows={3}
								className="border border-(--rule) bg-(--surface-container-low) px-3 py-2 font-sans text-[14px] text-(--on-surface) placeholder:text-(--dim) focus:outline-2 focus:outline-(--primary-container)"
							/>
							<div className="flex justify-end gap-2">
								<button
									type="button"
									onClick={() => {
										setStatusTarget(null);
										setRejectionReason("");
									}}
									className="border border-(--rule) px-4 py-1.5 font-sans text-[12px] text-(--on-surface) transition-colors hover:bg-(--surface-container-low)"
								>
									Cancel
								</button>
								<button
									type="button"
									onClick={handleStatusConfirm}
									disabled={updateStatus.isPending}
									className="border border-(--destructive) bg-(--destructive) px-4 py-1.5 font-sans text-[12px] text-white transition-colors hover:bg-(--error) disabled:opacity-50"
								>
									{updateStatus.isPending ? "Rejecting..." : "Confirm Reject"}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
