import {
	ArrowDown01Icon,
	SearchIcon,
	Sorting01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { EmptyState } from "@/shared/components/ux/EmptyState";
import { ErrorState } from "@/shared/components/ux/ErrorState";
import { LoadingState } from "@/shared/components/ux/LoadingState";
import { useJobs } from "../hooks";
import { JobCard } from "./JobCard";

const LOCATION_TYPES = [
	{ value: "", label: "All" },
	{ value: "REMOTE", label: "Remote" },
	{ value: "ONSITE", label: "Onsite" },
	{ value: "HYBRID", label: "Hybrid" },
] as const;

const EXPERIENCE_LEVELS = [
	{ value: "", label: "All" },
	{ value: "JUNIOR", label: "Junior" },
	{ value: "MID", label: "Mid" },
	{ value: "SENIOR", label: "Senior" },
	{ value: "LEAD", label: "Lead" },
] as const;

const SORT_OPTIONS = [
	{ value: "newest", label: "Most Recent" },
	{ value: "oldest", label: "Oldest" },
	{ value: "salary_high", label: "Salary: High" },
	{ value: "salary_low", label: "Salary: Low" },
] as const;

const SALARY_PRESETS = [
	{ value: "", label: "Any Salary" },
	{ value: "50000", label: "$50k+" },
	{ value: "100000", label: "$100k+" },
	{ value: "150000", label: "$150k+" },
	{ value: "200000", label: "$200k+" },
] as const;

function FilterDropdown({
	label,
	options,
	value,
	onChange,
}: {
	label: string;
	options: readonly { value: string; label: string }[];
	value: string;
	onChange: (value: string) => void;
}) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const selected = options.find((o) => o.value === value);

	return (
		<div ref={ref} className="relative">
			<button
				type="button"
				onClick={() => setOpen(!open)}
				aria-expanded={open}
				aria-haspopup="listbox"
				className="flex cursor-pointer items-center gap-2 border border-(--rule) bg-(--background) px-3 py-2 font-mono-label text-mono-label text-(--body) uppercase transition-colors hover:border-(--dim)"
			>
				{selected && selected.value ? selected.label : label}
				<HugeiconsIcon
					icon={ArrowDown01Icon}
					strokeWidth={2}
					className="h-3 w-3 text-(--dim)"
				/>
			</button>
			{open && (
				<div
					role="listbox"
					aria-label={`${label} options`}
					className="absolute right-0 top-full z-50 mt-1 w-44 border border-(--rule) bg-(--surface-container) shadow-lg"
				>
					{options.map((option) => (
						<button
							key={option.value}
							type="button"
							role="option"
							aria-selected={value === option.value}
							onClick={() => {
								onChange(option.value);
								setOpen(false);
							}}
							className={`flex w-full cursor-pointer px-3 py-2 text-left font-mono-label text-mono-label uppercase transition-colors hover:bg-(--surface-container-high) ${
								value === option.value
									? "text-(--primary-container) bg-(--primary-container)/5"
									: "text-(--body)"
							}`}
						>
							{option.label}
						</button>
					))}
				</div>
			)}
		</div>
	);
}

export function JobsMarketplace() {
	const navigate = useNavigate();
	const search = useSearch({ from: "/_public/jobs" }) as Record<
		string,
		string | undefined
	>;

	const [searchInput, setSearchInput] = useState(
		search.search ?? search.keyword ?? "",
	);

	useEffect(() => {
		setSearchInput(search.search ?? search.keyword ?? "");
	}, [search.search, search.keyword]);

	const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined,
	);

	function setParam(key: string, value: string) {
		navigate({
			to: "/jobs",
			search: { ...search, [key]: value || undefined },
			replace: true,
		});
	}

	function handleSearchInput(value: string) {
		setSearchInput(value);
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => {
			setParam("search", value);
		}, 400);
	}

	function clearAll() {
		navigate({ to: "/jobs", search: {}, replace: true });
	}

	const {
		data,
		isLoading,
		isError,
		error,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useJobs({
		search: search.search,
		locationType: search.locationType,
		experienceLevel: search.experienceLevel,
		sortBy:
			(search.sortBy as "newest" | "oldest" | "salary_high" | "salary_low") ??
			undefined,
		salaryMin: search.salaryMin,
		salaryMax: search.salaryMax,
	});

	const jobs = data?.jobs ?? [];
	const hasActiveFilters =
		search.search ||
		search.locationType ||
		search.experienceLevel ||
		search.sortBy ||
		search.salaryMin;

	return (
		<>
			<section
				className="relative w-full overflow-hidden border-b border-(--rule)"
				style={{
					backgroundImage:
						"linear-gradient(to right, var(--rule) 1px, transparent 1px), linear-gradient(to bottom, var(--rule) 1px, transparent 1px)",
					backgroundSize: "24px 24px",
				}}
			>
				<div className="pointer-events-none absolute right-1/4 top-0 h-96 w-96 rounded-full bg-(--primary) opacity-5 blur-[120px]" />
				<div className="relative z-10 mx-auto max-w-(--max-width) px-(--margin) py-section-v-pad">
					<div className="max-w-2xl">
						<span className="mono-label mb-4 block text-(--dim) uppercase">
							// job_discovery
						</span>
						<h1 className="font-masthead-4xl text-masthead-4xl mb-6 text-(--on-background)">
							Explore
							<br />
							Opportunities.
						</h1>
						<p className="font-ui-lg text-ui-lg mb-8 max-w-xl text-(--body)">
							A high-density technical pipeline for elite professionals. Filter
							signal from noise and find the roles shaping the industrial
							vanguard.
						</p>
					</div>
				</div>
			</section>

			<div className="sticky top-16 z-40 w-full border-b border-(--rule) bg-(--surface-container)">
				<div className="mx-auto flex max-w-(--max-width) flex-wrap items-center justify-between gap-4 px-(--margin) py-3">
					<div className="flex max-w-md flex-grow items-center border border-(--rule) bg-(--background) px-3 transition-colors focus-within:border-(--primary)">
						<HugeiconsIcon
							icon={SearchIcon}
							strokeWidth={2}
							className="h-[18px] w-[18px] text-(--dim)"
						/>
						<input
							type="text"
							value={searchInput}
							onChange={(e) => handleSearchInput(e.target.value)}
							placeholder="Search by keyword or company..."
							aria-label="Search jobs by keyword or company"
							className="w-full bg-transparent py-2 pl-2 font-ui-sm text-ui-sm text-(--on-background) placeholder:text-(--dim) focus:ring-0"
						/>
					</div>
					<div className="flex flex-wrap items-center gap-3">
						<FilterDropdown
							label="Role Type"
							options={EXPERIENCE_LEVELS}
							value={search.experienceLevel ?? ""}
							onChange={(v) => setParam("experienceLevel", v)}
						/>
						<FilterDropdown
							label="Location"
							options={LOCATION_TYPES}
							value={search.locationType ?? ""}
							onChange={(v) => setParam("locationType", v)}
						/>
						<FilterDropdown
							label="Salary"
							options={SALARY_PRESETS}
							value={search.salaryMin ?? ""}
							onChange={(v) => setParam("salaryMin", v)}
						/>
						{hasActiveFilters && (
							<button
								type="button"
								onClick={clearAll}
								className="mono-label cursor-pointer text-(--primary) uppercase underline-offset-4 transition-colors hover:underline"
							>
								Clear All
							</button>
						)}
					</div>
				</div>
			</div>

			<section className="mx-auto max-w-(--max-width) px-(--margin) py-8">
				<div className="mb-6 flex items-end justify-between">
					<span className="mono-label text-(--dim) uppercase">
						//{" "}
						{isLoading
							? "loading_listings"
							: `${jobs.toLocaleString()}${jobs.length === 1 ? "_active_listing" : "_active_listings"}`}
					</span>
					<div className="flex items-center gap-2">
						<HugeiconsIcon
							icon={Sorting01Icon}
							strokeWidth={2}
							className="h-4 w-4 text-(--dim)"
						/>
						<select
							value={search.sortBy ?? "newest"}
							onChange={(e) => setParam("sortBy", e.target.value)}
							aria-label="Sort jobs"
							className="mono-label cursor-pointer bg-transparent p-0 pr-6 text-(--body) uppercase focus:ring-0"
						>
							{SORT_OPTIONS.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</select>
					</div>
				</div>

				{isLoading && (
					<div
						className="grid grid-cols-1 gap-4 lg:grid-cols-2"
						role="status"
						aria-label="Loading jobs"
					>
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<div
								key={i}
								className="h-[180px] border border-(--rule) bg-(--surface-container)"
							>
								<LoadingState variant="skeleton" count={3} />
							</div>
						))}
					</div>
				)}

				{isError && (
					<section role="alert" aria-live="assertive">
						<ErrorState
							message={(error as Error)?.message ?? "Failed to load jobs."}
						/>
					</section>
				)}

				{!isLoading && !isError && jobs.length === 0 && (
					<section role="status" aria-live="polite">
						<EmptyState
							title="No jobs found"
							description="No jobs matching your criteria. Try adjusting your filters or search terms."
						/>
					</section>
				)}

				{!isLoading && !isError && jobs.length > 0 && (
					<>
						<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
							{jobs.map((job, idx) => (
								<JobCard
									key={job.id}
									job={job}
									featured={idx === 0 && !hasActiveFilters}
								/>
							))}
						</div>

						{hasNextPage && (
							<div className="mt-8 flex justify-center">
								<button
									type="button"
									onClick={() => fetchNextPage()}
									disabled={isFetchingNextPage}
									aria-busy={isFetchingNextPage}
									className="mono-label cursor-pointer border border-(--rule) bg-transparent px-8 py-3 uppercase text-(--body) transition-colors hover:bg-(--surface-container-high) disabled:opacity-50"
								>
									{isFetchingNextPage ? "Loading..." : "Load More Roles"}
								</button>
							</div>
						)}
					</>
				)}
			</section>
		</>
	);
}
