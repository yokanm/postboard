import type { DashboardMetric, PlatformStats } from "../../types";
import { StatsCard } from "./StatsCard";

interface StatsGridProps {
	stats: PlatformStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
	const metrics: DashboardMetric[] = [
		{
			label: "// TOTAL USERS",
			value: stats.users.total,
		},
		{
			label: "// TOTAL RECRUITERS",
			value: stats.companies.total,
			sublabel: "registered companies",
		},
		{
			label: "// TOTAL JOBS",
			value: stats.jobs.total,
			sublabel: `${stats.jobs.open} open`,
		},
		{
			label: "// TOTAL APPLICATIONS",
			value: stats.applications.total,
			sublabel: `${stats.applications.pending} pending`,
		},
		{
			label: "// PLATFORM ACTIVITY",
			value: stats.notifications.total,
			sublabel: `${stats.notifications.unread} unread`,
		},
	];

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
			{metrics.map((metric) => (
				<StatsCard key={metric.label} metric={metric} />
			))}
		</div>
	);
}
