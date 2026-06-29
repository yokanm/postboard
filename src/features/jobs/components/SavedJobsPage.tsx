import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useJobs } from "../hooks";
import type { JobSummary } from "../types";
import { useSavedJobs } from "./SavedJobsButton";

type SavedFilter = "ALL" | "ACTIVE" | "EXPIRED";

const FILTER_TABS: SavedFilter[] = ["ALL", "ACTIVE", "EXPIRED"];

function matchesFilter(job: JobSummary, filter: SavedFilter): boolean {
	if (filter === "ALL") return true;
	if (filter === "ACTIVE") return job.status === "OPEN";
	if (filter === "EXPIRED")
		return job.status === "CLOSED" || job.status === "EXPIRED";
	return true;
}

function formatSalary(
	min: number | null,
	max: number | null,
	currency: string,
): string {
	if (min === null && max === null) return "";
	const fmt = (v: number) =>
		new Intl.NumberFormat("en-US", {
			style: "currency",
			currency,
			maximumFractionDigits: 0,
		}).format(v);
	if (min !== null && max !== null) return `${fmt(min)} – ${fmt(max)}`;
	if (min !== null) return `From ${fmt(min)}`;
	if (max !== null) return `Up to ${fmt(max)}`;
	return "";
}

function JobCardCompact({ job }: { job: JobSummary }) {
	const initials = job.company.name
		.split(" ")
		.map((w) => w[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	return (
		<Link
			to="/jobs/$jobId"
			params={{ jobId: job.id }}
			className="flex flex-col gap-3 border border-(--rule) bg-(--ink) p-4 transition-colors duration-150 hover:bg-(--surface-container-low)"
		>
			<div className="flex items-start gap-3">
				<div className="flex h-12 w-12 shrink-0 items-center justify-center border border-(--rule) bg-(--surface-container-low)">
					<span className="mono-label text-[13px] text-(--dim)">
						{initials}
					</span>
				</div>
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-2">
						<h3 className="m-0 font-sans text-[15px] font-medium leading-tight text-(--on-surface)">
							{job.title}
						</h3>
						<span
							className={`mono-label shrink-0 text-[10px] uppercase tracking-[0.05em] ${
								job.status === "OPEN" ? "text-(--live)" : "text-(--dim)"
							}`}
						>
							{job.status === "OPEN" ? "Active" : "Expired"}
						</span>
					</div>
					<p className="m-0 mt-0.5 font-sans text-[13px] text-(--body)">
						{job.company.name}
					</p>
				</div>
			</div>

			<div className="flex flex-wrap items-center gap-3 font-sans text-[13px] text-(--dim)">
				{job.location && <span className="truncate">{job.location}</span>}
				<span>
					{job.locationType === "REMOTE"
						? "Remote"
						: job.locationType === "HYBRID"
							? "Hybrid"
							: "On-site"}
				</span>
				{formatSalary(job.salaryMin, job.salaryMax, job.currency) && (
					<span className="mono-label text-(--live-dim)">
						{formatSalary(job.salaryMin, job.salaryMax, job.currency)}
					</span>
				)}
			</div>

			<div className="flex items-center gap-2 border-t border-(--rule) pt-3">
				<span className="mono-label text-[11px] text-(--primary) hover:text-(--primary-container)">
					VIEW ROLE →
				</span>
			</div>
		</Link>
	);
}

export function SavedJobsPage() {
	const savedIds = useSavedJobs();
	const { data, isLoading } = useJobs();
	const allJobs = data?.jobs ?? [];
	const [activeTab, setActiveTab] = useState<SavedFilter>("ALL");

	const savedJobs = useMemo(
		() => allJobs.filter((j) => savedIds.includes(j.id)),
		[allJobs, savedIds],
	);

	const filteredJobs = useMemo(
		() => savedJobs.filter((j) => matchesFilter(j, activeTab)),
		[savedJobs, activeTab],
	);

	const countsByTab = useMemo(() => {
		const counts: Record<SavedFilter, number> = {
			ALL: savedJobs.length,
			ACTIVE: savedJobs.filter((j) => j.status === "OPEN").length,
			EXPIRED: savedJobs.filter(
				(j) => j.status === "CLOSED" || j.status === "EXPIRED",
			).length,
		};
		return counts;
	}, [savedJobs]);

	const emptyMessages: Record<
		SavedFilter,
		{ title: string; description: string }
	> = {
		ALL: {
			title: "NO_SAVED_JOBS",
			description:
				"You haven&apos;t saved any jobs yet. Browse the marketplace and save jobs you&apos;re interested in.",
		},
		ACTIVE: {
			title: "NO_ACTIVE_SAVED_JOBS",
			description:
				"None of your saved jobs are currently accepting applications.",
		},
		EXPIRED: {
			title: "NO_EXPIRED_SAVED_JOBS",
			description: "None of your saved jobs have expired yet.",
		},
	};

	return (
		<div className="mx-auto flex w-full max-w-[1000px] flex-col gap-6 p-4 sm:p-6">
			<header className="flex flex-col gap-1">
				<span className="mono-label text-(--primary-container)">
					// SAVED_JOBS
				</span>
				<h1 className="font-headline m-0 text-2xl text-(--on-surface) sm:text-[32px]">
					Saved Jobs
				</h1>
			</header>

			{/* Filter Tabs */}
			<div
				className="-mx-4 flex gap-0 border-b border-(--rule) overflow-x-auto px-4 sm:-mx-6 sm:px-6"
				role="tablist"
				aria-label="Saved jobs filter"
			>
				{FILTER_TABS.map((tab) => (
					<button
						key={tab}
						type="button"
						role="tab"
						aria-selected={activeTab === tab}
						aria-current={activeTab === tab ? "page" : undefined}
						onClick={() => setActiveTab(tab)}
						className={`relative flex cursor-pointer items-center gap-2 px-4 py-3 font-sans text-[13px] transition-colors duration-150 ${
							activeTab === tab
								? "text-(--on-surface)"
								: "text-(--dim) hover:text-(--on-surface)"
						}`}
					>
						<span>
							{tab === "ALL" ? "All" : tab === "ACTIVE" ? "Active" : "Expired"}
						</span>
						<span className="mono-label text-[11px] text-(--dim)">
							({countsByTab[tab]})
						</span>
						{activeTab === tab && (
							<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-(--primary)" />
						)}
					</button>
				))}
			</div>

			{/* Loading State */}
			{isLoading && (
				<div className="flex items-center justify-center p-8">
					<p className="font-sans text-[15px] text-(--dim)">Loading...</p>
				</div>
			)}

			{/* Empty State */}
			{!isLoading && filteredJobs.length === 0 && (
				<div className="flex flex-col items-center gap-3 border border-(--rule) p-8">
					<span className="mono-label text-(--dim)">
						{emptyMessages[activeTab].title}
					</span>
					<p className="m-0 max-w-[380px] text-center font-sans text-[14px] text-(--body)">
						{emptyMessages[activeTab].description}
					</p>
					{activeTab !== "ALL" && (
						<button
							type="button"
							onClick={() => setActiveTab("ALL")}
							className="mono-label mt-2 cursor-pointer border border-(--rule) bg-(--surface-container-low) px-4 py-2 text-[11px] uppercase tracking-[0.05em] text-(--primary) transition-colors duration-150 hover:bg-(--surface-container)"
						>
							View all saved jobs
						</button>
					)}
				</div>
			)}

			{/* Grid */}
			{!isLoading && filteredJobs.length > 0 && (
				<div className="grid grid-cols-1 gap-px bg-(--rule) sm:grid-cols-2">
					{filteredJobs.map((job) => (
						<div key={job.id} className="bg-(--ink)">
							<JobCardCompact job={job} />
						</div>
					))}
				</div>
			)}
		</div>
	);
}
