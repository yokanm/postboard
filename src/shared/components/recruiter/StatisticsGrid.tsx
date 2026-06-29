import type { ReactNode } from "react";

interface StatItem {
	label: string;
	value: number | string;
	accent?: boolean;
	icon?: ReactNode;
}

interface StatisticsGridProps {
	stats: StatItem[];
	columns?: 2 | 3 | 4;
}

export function StatisticsGrid({ stats, columns = 4 }: StatisticsGridProps) {
	return (
		<div
			className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${
				columns >= 3 ? "lg:grid-cols-3" : ""
			} ${columns >= 4 ? "xl:grid-cols-4" : ""}`}
		>
			{stats.map((stat) => (
				<div key={stat.label} className="border border-(--rule) p-5">
					<div className="flex items-start justify-between">
						<div className="flex flex-col gap-1">
							<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
								// {stat.label}
							</span>
							<p
								className={`font-serif text-3xl ${stat.accent ? "text-(--primary-container)" : "text-(--on-surface)"}`}
							>
								{stat.value}
							</p>
						</div>
						{stat.icon && (
							<div className="text-(--muted) shrink-0">{stat.icon}</div>
						)}
					</div>
				</div>
			))}
		</div>
	);
}
