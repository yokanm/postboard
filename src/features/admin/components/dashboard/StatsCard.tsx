import type { DashboardMetric } from "../../types";

interface StatsCardProps {
	metric: DashboardMetric;
}

export function StatsCard({ metric }: StatsCardProps) {
	return (
		<div className="border border-(--rule) p-5">
			<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
				{metric.label}
			</span>
			<p className="mt-2 font-serif text-3xl text-(--on-surface)">
				{metric.value.toLocaleString()}
			</p>
			{metric.sublabel && (
				<p className="mt-1 font-sans text-[12px] text-(--dim)">
					{metric.sublabel}
				</p>
			)}
		</div>
	);
}
