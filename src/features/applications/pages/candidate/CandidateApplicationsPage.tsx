import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/shared/components/ux/EmptyState";
import { ErrorState } from "@/shared/components/ux/ErrorState";
import { ApplicationCard } from "../../components/ApplicationCard";
import { WithdrawConfirmDialog } from "../../components/WithdrawConfirmDialog";
import { useMyApplications, useWithdrawApplication } from "../../hooks";

const FILTER_TABS: Array<{ value: string; label: string }> = [
	{ value: "", label: "All" },
	{ value: "PENDING", label: "Pending" },
	{ value: "REVIEWED", label: "Under Review" },
	{ value: "SHORTLISTED", label: "Shortlisted" },
	{ value: "ACCEPTED", label: "Accepted" },
	{ value: "REJECTED", label: "Rejected" },
];

export function CandidateApplicationsPage() {
	const navigate = useNavigate();
	const [statusFilter, setStatusFilter] = useState("");
	const {
		data,
		isLoading,
		isError,
		error,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useMyApplications();
	const withdrawMutation = useWithdrawApplication();
	const [withdrawTarget, setWithdrawTarget] = useState<{
		id: string;
		jobTitle: string;
	} | null>(null);

	const allApplications = data?.applications ?? [];
	const applications = statusFilter
		? allApplications.filter((a) => a.status === statusFilter)
		: allApplications;

	function handleWithdraw() {
		if (!withdrawTarget) return;
		withdrawMutation.mutate(withdrawTarget.id, {
			onSuccess: () => setWithdrawTarget(null),
		});
	}

	function handleCardClick(id: string) {
		navigate({
			to: "/candidate/applications/$applicationId",
			params: { applicationId: id },
		});
	}

	return (
		<div className="flex flex-col gap-6 p-6">
			<header className="flex flex-col gap-1">
				<span className="mono-label text-(--primary-container)">
					// MY_APPLICATIONS
				</span>
				<h1 className="font-headline m-0 text-(--on-surface)">Applications</h1>
				<p className="font-body m-0 text-(--body)">
					Track and manage your job applications.
				</p>
			</header>

			{/* Filter Tabs */}
			<div className="flex flex-wrap items-center border-b border-(--rule)">
				{FILTER_TABS.map((tab) => (
					<button
						key={tab.value}
						type="button"
						onClick={() => setStatusFilter(tab.value)}
						className={`px-4 py-2 font-sans text-[12px] uppercase tracking-[0.05em] transition-colors ${
							statusFilter === tab.value
								? "border-b-2 border-(--primary-container) text-(--primary-container)"
								: "border-b-2 border-transparent text-(--dim) hover:text-(--on-surface)"
						}`}
						aria-current={statusFilter === tab.value ? "page" : undefined}
					>
						{tab.label}
					</button>
				))}
				<span className="mono-label ml-auto px-1 text-[11px] text-(--dim)">
					{applications.length} application
					{applications.length !== 1 ? "s" : ""}
				</span>
			</div>

			{isLoading && (
				<div className="flex flex-col gap-px">
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} className="h-28 w-full" />
					))}
				</div>
			)}

			{isError && (
				<ErrorState
					message={(error as Error)?.message ?? "Failed to load applications."}
				/>
			)}

			{!isLoading && !isError && applications.length === 0 && (
				<EmptyState
					title={
						statusFilter
							? `No ${FILTER_TABS.find((f) => f.value === statusFilter)?.label?.toLowerCase()} applications`
							: "No applications yet"
					}
					description={
						statusFilter
							? "Try a different filter."
							: "Browse available positions to get started."
					}
					action={{
						label: "Browse Jobs",
						onClick: () => navigate({ to: "/jobs" }),
					}}
				/>
			)}

			{!isLoading && !isError && applications.length > 0 && (
				<div className="flex flex-col gap-px">
					{applications.map((app) => (
						<ApplicationCard
							key={app.id}
							application={app}
							onClick={handleCardClick}
							onWithdraw={(id) =>
								setWithdrawTarget({ id, jobTitle: app.job.title })
							}
						/>
					))}
				</div>
			)}

			{hasNextPage && (
				<div className="flex justify-center">
					<button
						type="button"
						onClick={() => fetchNextPage()}
						disabled={isFetchingNextPage}
						className="mono-label cursor-pointer border border-(--rule) bg-transparent px-6 py-2 text-[11px] uppercase tracking-[0.05em] text-(--dim) transition-colors hover:border-(--on-surface) hover:text-(--on-surface) disabled:opacity-50"
					>
						{isFetchingNextPage ? "Loading..." : "Load More"}
					</button>
				</div>
			)}

			<WithdrawConfirmDialog
				open={!!withdrawTarget}
				onOpenChange={(open) => !open && setWithdrawTarget(null)}
				onConfirm={handleWithdraw}
				isPending={withdrawMutation.isPending}
				jobTitle={withdrawTarget?.jobTitle ?? ""}
			/>
		</div>
	);
}
