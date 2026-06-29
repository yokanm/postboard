import { useNavigate, useSearch } from "@tanstack/react-router";

const LOCATION_TYPES = [
	{ value: "", label: "ALL" },
	{ value: "REMOTE", label: "REMOTE" },
	{ value: "ONSITE", label: "ONSITE" },
	{ value: "HYBRID", label: "HYBRID" },
] as const;

const EXPERIENCE_LEVELS = [
	{ value: "", label: "ALL" },
	{ value: "JUNIOR", label: "JUNIOR" },
	{ value: "MID", label: "MID" },
	{ value: "SENIOR", label: "SENIOR" },
	{ value: "LEAD", label: "LEAD" },
] as const;

export function JobFilters() {
	const navigate = useNavigate();
	const search = useSearch({ from: "/_public/jobs" }) as Record<
		string,
		string | undefined
	>;

	function setParam(key: string, value: string) {
		navigate({
			to: "/jobs",
			search: { ...search, [key]: value || undefined },
			replace: true,
		});
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-2">
				<label htmlFor="keyword" className="mono-label uppercase text-(--dim)">
					SEARCH
				</label>
				<input
					id="keyword"
					type="text"
					defaultValue={search.keyword ?? ""}
					onChange={(e) => setParam("keyword", e.target.value)}
					placeholder="Title, skill, keyword..."
					className="border border-(--rule) bg-(--surface-container-low) px-3 py-2 font-sans text-[14px] text-(--on-surface) placeholder:text-(--dim) focus:outline-2 focus:outline-(--primary-container)"
				/>
			</div>

			<div className="flex flex-col gap-2">
				<span className="mono-label uppercase text-(--dim)">LOCATION TYPE</span>
				<div className="flex flex-wrap gap-1">
					{LOCATION_TYPES.map((lt) => (
						<button
							key={lt.value}
							type="button"
							onClick={() => setParam("locationType", lt.value)}
							className={`mono-label cursor-pointer border px-3 py-1.5 uppercase tracking-[0.05em] transition-colors duration-150 ${
								(search.locationType ?? "") === lt.value
									? "border-(--primary-container) bg-(--primary-container) text-(--on-primary-container)"
									: "border-(--rule) bg-transparent text-(--dim) hover:border-(--primary-container) hover:text-(--primary-container)"
							}`}
						>
							{lt.label}
						</button>
					))}
				</div>
			</div>

			<div className="flex flex-col gap-2">
				<span className="mono-label uppercase text-(--dim)">
					EXPERIENCE LEVEL
				</span>
				<div className="flex flex-wrap gap-1">
					{EXPERIENCE_LEVELS.map((el) => (
						<button
							key={el.value}
							type="button"
							onClick={() => setParam("experienceLevel", el.value)}
							className={`mono-label cursor-pointer border px-3 py-1.5 uppercase tracking-[0.05em] transition-colors duration-150 ${
								(search.experienceLevel ?? "") === el.value
									? "border-(--primary-container) bg-(--primary-container) text-(--on-primary-container)"
									: "border-(--rule) bg-transparent text-(--dim) hover:border-(--primary-container) hover:text-(--primary-container)"
							}`}
						>
							{el.label}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
