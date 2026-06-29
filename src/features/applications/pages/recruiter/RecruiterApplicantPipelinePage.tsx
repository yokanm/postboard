import { useCallback, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { isApiRequestError } from "@/lib/api/client";
import { CandidateDetailDrawer } from "../../components/CandidateDetailDrawer";
import { KanbanColumn } from "../../components/KanbanColumn";
import { UpdateApplicationStatusDialog } from "../../components/UpdateApplicationStatusDialog";
import { useJobApplications, useUpdateApplicationStatus } from "../../hooks";
import type { ApplicationListItem, ApplicationStatus } from "../../types";
import {
	ALL_STATUSES,
	getApplicationStatusConfig,
} from "../../utils/application-status";

interface RecruiterApplicantPipelinePageProps {
	jobId: string;
}

export function RecruiterApplicantPipelinePage({
	jobId,
}: RecruiterApplicantPipelinePageProps) {
	const { data, isLoading, isError, error } = useJobApplications(jobId);
	const updateStatus = useUpdateApplicationStatus();
	const [selectedApp, setSelectedApp] = useState<ApplicationListItem | null>(
		null,
	);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [statusDialogApp, setStatusDialogApp] =
		useState<ApplicationListItem | null>(null);

	const applications = data?.applications ?? [];

	const grouped = useMemo(() => {
		const map: Record<string, ApplicationListItem[]> = {};
		for (const status of ALL_STATUSES) {
			map[status] = [];
		}
		for (const app of applications) {
			if (map[app.status]) {
				map[app.status].push(app);
			}
		}
		return map;
	}, [applications]);

	function handleCardClick(application: ApplicationListItem) {
		setSelectedApp(application);
		setDrawerOpen(true);
	}

	const handleDrop = useCallback(
		(applicationId: string, newStatus: string) => {
			const app = applications.find((a) => a.id === applicationId);
			if (!app || app.status === newStatus) return;

			// Optimistic update would go here in production
			updateStatus.mutate({
				applicationId,
				input: { status: newStatus as ApplicationStatus },
			});

			// Open status dialog for non-trivial transitions
			const updatedApp = { ...app, status: newStatus as ApplicationStatus };
			setStatusDialogApp(updatedApp);
		},
		[applications, updateStatus],
	);

	function handleStatusDialogConfirm(
		status: ApplicationStatus,
		rejectionReason?: string,
	) {
		if (!statusDialogApp) return;
		updateStatus.mutate(
			{
				applicationId: statusDialogApp.id,
				input: { status, rejectionReason },
			},
			{
				onSuccess: () => setStatusDialogApp(null),
			},
		);
	}

	if (isLoading) {
		return (
			<div className="flex flex-col gap-4 p-6">
				<Skeleton className="h-8 w-64 rounded-none" />
				<Skeleton className="h-4 w-96 rounded-none" />
				<div className="mt-4 flex gap-4 overflow-x-auto">
					{[1, 2, 3, 4, 5].map((i) => (
						<Skeleton
							key={i}
							className="h-96 min-w-[280px] flex-1 rounded-none"
						/>
					))}
				</div>
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
							: "Failed to load applications."}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6 p-6">
			<header className="flex flex-col gap-1">
				<span className="mono-label text-(--primary-container)">
					// APPLICANT_PIPELINE
				</span>
				<h1 className="font-headline m-0 text-(--on-surface)">
					Applicant Pipeline
				</h1>
				<p className="font-body m-0 text-(--body)">
					Review and manage candidates for this position.
				</p>
			</header>

			{applications.length === 0 ? (
				<div className="flex flex-col items-center gap-3 border border-(--rule) p-8">
					<span className="mono-label text-(--dim)">NO_APPLICANTS</span>
					<p className="m-0 max-w-[320px] text-center font-sans text-[14px] text-(--body)">
						No applications have been submitted for this position yet.
					</p>
				</div>
			) : (
				<div className="flex gap-4 overflow-x-auto pb-4">
					{ALL_STATUSES.map((status) => {
						const config = getApplicationStatusConfig(status);
						const apps = grouped[status] ?? [];
						return (
							<KanbanColumn
								key={status}
								title={config.label}
								status={status}
								applications={apps}
								count={apps.length}
								onCardClick={handleCardClick}
								onDrop={handleDrop}
							/>
						);
					})}
				</div>
			)}

			<CandidateDetailDrawer
				application={selectedApp}
				open={drawerOpen}
				onOpenChange={setDrawerOpen}
			/>

			{statusDialogApp && (
				<UpdateApplicationStatusDialog
					open={!!statusDialogApp}
					onOpenChange={(open) => {
						if (!open) setStatusDialogApp(null);
					}}
					currentStatus={statusDialogApp.status}
					candidateName={`${statusDialogApp.user.firstName} ${statusDialogApp.user.lastName}`}
					onConfirm={handleStatusDialogConfirm}
					isPending={updateStatus.isPending}
				/>
			)}
		</div>
	);
}
