import { createFileRoute } from "@tanstack/react-router";
import { JobsMarketplace } from "@/features/jobs/components/JobsMarketplace";
import type { ExperienceLevel, LocationType } from "@/features/jobs/types";

const LOCATION_TYPES = ["REMOTE", "ONSITE", "HYBRID"] as const;
const EXPERIENCE_LEVELS = ["JUNIOR", "MID", "SENIOR", "LEAD"] as const;
const SORT_OPTIONS = ["newest", "oldest", "salary_high", "salary_low"] as const;

type JobSearch = {
	search?: string;
	locationType?: LocationType;
	experienceLevel?: ExperienceLevel;
	sortBy?: (typeof SORT_OPTIONS)[number];
	salaryMin?: string;
	salaryMax?: string;
};

export const Route = createFileRoute("/_public/jobs")({
	validateSearch: (search: Record<string, string | undefined>): JobSearch => ({
		...(search.search ? { search: search.search } : {}),
		...((LOCATION_TYPES as readonly string[]).includes(
			search.locationType ?? "",
		)
			? { locationType: search.locationType as LocationType }
			: {}),
		...((EXPERIENCE_LEVELS as readonly string[]).includes(
			search.experienceLevel ?? "",
		)
			? { experienceLevel: search.experienceLevel as ExperienceLevel }
			: {}),
		...((SORT_OPTIONS as readonly string[]).includes(search.sortBy ?? "")
			? { sortBy: search.sortBy as (typeof SORT_OPTIONS)[number] }
			: {}),
		...(search.salaryMin ? { salaryMin: search.salaryMin } : {}),
		...(search.salaryMax ? { salaryMax: search.salaryMax } : {}),
	}),
	head: () => ({
		meta: [
			{ title: "Browse Jobs - Postboard" },
			{
				name: "description",
				content:
					"Discover elite technical roles across the industrial broadsheet network. Search by keyword, location, experience level, and salary range.",
			},
			{ property: "og:title", content: "Browse Jobs - Postboard" },
			{
				property: "og:description",
				content:
					"Find your next role among high-density technical opportunities curated for elite professionals.",
			},
			{ name: "twitter:title", content: "Browse Jobs - Postboard" },
			{
				name: "twitter:description",
				content:
					"Find your next role among high-density technical opportunities curated for elite professionals.",
			},
		],
	}),
	component: JobsMarketplace,
});
