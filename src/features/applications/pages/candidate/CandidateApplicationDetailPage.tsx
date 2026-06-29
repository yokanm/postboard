import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { isApiRequestError } from "@/lib/api/client";
import { ApplicationStatusBadge } from "../../components/ApplicationStatusBadge";
import { ApplicationTimeline } from "../../components/ApplicationTimeline";
import { WithdrawConfirmDialog } from "../../components/WithdrawConfirmDialog";
import { useMyApplications, useWithdrawApplication } from "../../hooks";

interface CandidateApplicationDetailPageProps {
	applicationId: string;
}

export function CandidateApplicationDetailPage({
	applicationId,
}: CandidateApplicationDetailPageProps) {
	const navigate = useNavigate();
	const { data, isLoading, isError, error } = useMyApplications();
	const withdrawMutation = useWithdrawApplication();
	const [showWithdraw, setShowWithdraw] = useState(false);

	const application = useMemo(() => {
		if (!data) return null;
		return data.applications.find((a) => a.id === applicationId) ?? null;
	}, [data, applicationId]);

	if (isLoading) {
		return (
			<div className="flex flex-col gap-4 p-6">
				<Skeleton className="h-8 w-64 rounded-none" />
				<Skeleton className="h-4 w-96 rounded-none" />
				<Skeleton className="mt-4 h-48 w-full rounded-none" />
				<Skeleton className="h-32 w-full rounded-none" />
			</div>
		);
	}

	if (isError) {
		return (
			<div className="p-6">
				<div className="border border-(--error-container) bg-(--error-container) bg-opacity-10 p-4">
					<p className="m-0 font-sans text-[14px] text-(--error)">
						{isApiRequestError(error)
							? error.message
							: "Failed to load application."}
					</p>
				</div>
			</div>
		);
	}

	if (!application) {
		return (
			<div className="p-6">
				<div className="flex flex-col items-center gap-3 border border-(--rule) p-8">
					<span className="mono-label text-(--dim)">APPLICATION_NOT_FOUND</span>
					<p className="m-0 max-w-[320px] text-center font-sans text-[14px] text-(--body)">
						This application could not be found.
					</p>
					<button
						type="button"
						onClick={() => navigate({ to: "/candidate/applications" })}
						className="mono-label mt-2 cursor-pointer border border-(--primary-container) bg-(--primary-container) px-4 py-2 uppercase tracking-[0.05em] text-(--on-primary-container) transition-colors duration-150 hover:bg-(--primary)"
					>
						Back to Applications
					</button>
				</div>
			</div>
		);
	}

	const date = new Date(application.createdAt).toLocaleDateString("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
		year: "numeric",
	});

	return (
		<div className="flex flex-col gap-6 p-6">
			{/* Header */}
			<header className="flex items-start justify-between gap-4">
				<div className="flex flex-col gap-1">
					<button
						type="button"
						onClick={() => navigate({ to: "/candidate/applications" })}
						className="mono-label cursor-pointer bg-transparent text-left text-(--primary-container) no-underline transition-colors duration-150 hover:text-(--primary)"
					>
						← BACK TO APPLICATIONS
					</button>
					<h1 className="font-headline m-0 mt-2 text-(--on-surface)">
						{application.job.title}
					</h1>
					<p className="font-body m-0 text-(--body)">
						{application.job.company.name}
					</p>
				</div>
				<ApplicationStatusBadge status={application.status} />
			</header>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Main content */}
				<div className="flex flex-col gap-6 lg:col-span-2">
					{/* Company info */}
					<div className="flex flex-col gap-3 border border-(--rule) p-4">
						<span className="mono-label text-(--dim) uppercase">
							JOB DETAILS
						</span>
						<div className="flex flex-col gap-2">
							<div className="flex justify-between">
								<span className="mono-label text-(--dim)">TYPE</span>
								<span className="mono-label text-(--body)">
									{application.job.locationType}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="mono-label text-(--dim)">LEVEL</span>
								<span className="mono-label text-(--body)">
									{application.job.experienceLevel}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="mono-label text-(--dim)">APPLIED</span>
								<span className="mono-label text-(--body)">{date}</span>
							</div>
						</div>
					</div>

					{/* Cover Letter */}
					{application.coverLetter && (
						<div className="flex flex-col gap-3 border border-(--rule) p-4">
							<span className="mono-label text-(--dim) uppercase">
								COVER LETTER
							</span>
							<p className="m-0 font-sans text-[14px] leading-relaxed text-(--body) whitespace-pre-wrap">
								{application.coverLetter}
							</p>
						</div>
					)}

					{/* Resume */}
					<div className="flex flex-col gap-3 border border-(--rule) p-4">
						<span className="mono-label text-(--dim) uppercase">RESUME</span>
						{application.resumeUrl ? (
							<a
								href={application.resumeUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="mono-label text-(--primary-container) no-underline transition-colors duration-150 hover:text-(--primary)"
							>
								View Submitted Resume →
							</a>
						) : (
							<span className="font-sans text-[14px] text-(--body)">
								No resume was submitted with this application.
							</span>
						)}
					</div>

					{/* Rejection feedback */}
					{application.rejectionReason && (
						<div className="flex flex-col gap-3 border border-(--error-container) bg-(--error-container) bg-opacity-10 p-4">
							<span className="mono-label text-(--error) uppercase">
								FEEDBACK
							</span>
							<p className="m-0 font-sans text-[14px] leading-relaxed text-(--body)">
								{application.rejectionReason}
							</p>
						</div>
					)}

					{/* Withdraw action */}
					{application.status === "PENDING" && (
						<div className="flex justify-end border-t border-(--rule) pt-4">
							<button
								type="button"
								onClick={() => setShowWithdraw(true)}
								className="mono-label cursor-pointer border border-(--error) bg-transparent px-4 py-2 uppercase tracking-[0.05em] text-(--error) transition-colors duration-150 hover:bg-(--error) hover:text-(--on-error)"
							>
								Withdraw Application
							</button>
						</div>
					)}
				</div>

				{/* Sidebar */}
				<div className="flex flex-col gap-6">
					{/* Status Timeline */}
					<div className="border border-(--rule) p-4">
						<span className="mono-label mb-4 block text-(--dim) uppercase">
							APPLICATION STATUS
						</span>
						<ApplicationTimeline currentStatus={application.status} />
					</div>
				</div>
			</div>

			<WithdrawConfirmDialog
				open={showWithdraw}
				onOpenChange={setShowWithdraw}
				onConfirm={() =>
					withdrawMutation.mutate(application.id, {
						onSuccess: () => {
							setShowWithdraw(false);
							navigate({ to: "/candidate/applications" });
						},
					})
				}
				isPending={withdrawMutation.isPending}
				jobTitle={application.job.title}
			/>
		</div>
	);
}
