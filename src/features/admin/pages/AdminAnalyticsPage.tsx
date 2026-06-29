import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/shared/components/ux/ErrorState";
import { AnalyticsSection } from "../components/analytics/AnalyticsSection";
import { useAdminStats } from "../hooks";

const DATE_RANGES = [
	{ label: "All Time", value: "all" },
	{ label: "This Week", value: "week" },
	{ label: "This Month", value: "month" },
	{ label: "This Quarter", value: "quarter" },
] as const;

export function AdminAnalyticsPage() {
	const [dateRange, setDateRange] = useState("all");
	const { data: stats, isLoading, isError, refetch } = useAdminStats();

	if (isError) {
		return (
			<ErrorState
				message="Failed to load analytics data"
				onRetry={() => refetch()}
			/>
		);
	}

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
					// ANALYTICS
				</div>
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton
							key={i}
							className="h-[300px] w-full bg-(--surface-container-low)"
						/>
					))}
				</div>
			</div>
		);
	}

	if (!stats) return null;

	return (
		<div className="space-y-6">
			<div>
				<div className="mb-4 flex items-center justify-between">
					<div className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
						// ANALYTICS
					</div>
					<div className="flex gap-1">
						{DATE_RANGES.map((range) => (
							<button
								key={range.value}
								onClick={() => setDateRange(range.value)}
								className={`border px-3 py-1 font-sans text-[11px] transition-colors ${
									dateRange === range.value
										? "border-(--primary) bg-(--primary)/10 text-(--primary)"
										: "border-(--rule) text-(--dim) hover:text-(--on-surface)"
								}`}
							>
								{range.label}
							</button>
						))}
					</div>
				</div>
				<AnalyticsSection stats={stats} dateRange={dateRange} />
			</div>
		</div>
	);
}
