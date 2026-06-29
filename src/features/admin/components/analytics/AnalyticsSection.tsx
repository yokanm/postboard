import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { PlatformStats } from "../../types";

interface AnalyticsSectionProps {
	stats: PlatformStats;
	dateRange?: string;
}

const COLORS = ["#60A5FA", "#34D399", "#EF4444", "#F59E0B", "#C084FC"];

export function AnalyticsSection({ stats }: AnalyticsSectionProps) {
	const compositionData = [
		{ name: "Jobs", value: stats.jobs.total },
		{ name: "Companies", value: stats.companies.total },
		{ name: "Applications", value: stats.applications.total },
	];

	const jobStatusData = [
		{ name: "Open", value: stats.jobs.open },
		{ name: "Closed", value: stats.jobs.total - stats.jobs.open },
	];

	const appStatusData = [
		{ name: "Pending", value: stats.applications.pending },
		{
			name: "Other",
			value: stats.applications.total - stats.applications.pending,
		},
	];

	return (
		<div className="space-y-8">
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<div className="border border-(--rule) p-5">
					<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
						// PLATFORM COMPOSITION
					</span>
					<div className="mt-4 h-[250px]">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={compositionData}>
								<CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
								<XAxis
									dataKey="name"
									tick={{ fontSize: 12, fill: "#888" }}
									axisLine={{ stroke: "#2a2a2a" }}
								/>
								<YAxis
									tick={{ fontSize: 12, fill: "#888" }}
									axisLine={{ stroke: "#2a2a2a" }}
								/>
								<Tooltip
									contentStyle={{
										background: "#1a1a1a",
										border: "1px solid #2a2a2a",
										borderRadius: 0,
										fontSize: 13,
									}}
								/>
								<Bar dataKey="value" fill="#6366f1" radius={0} />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>

				<div className="border border-(--rule) p-5">
					<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
						// JOB STATUS BREAKDOWN
					</span>
					<div className="mt-4 h-[250px]">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={jobStatusData}
									cx="50%"
									cy="50%"
									innerRadius={60}
									outerRadius={100}
									dataKey="value"
									stroke="none"
								>
									{jobStatusData.map((_, index) => (
										<Cell key={`cell-${index}`} fill={COLORS[index]} />
									))}
								</Pie>
								<Tooltip
									contentStyle={{
										background: "#1a1a1a",
										border: "1px solid #2a2a2a",
										borderRadius: 0,
										fontSize: 13,
									}}
								/>
							</PieChart>
						</ResponsiveContainer>
					</div>
					<div className="mt-3 flex justify-center gap-6">
						{jobStatusData.map((entry, index) => (
							<div key={entry.name} className="flex items-center gap-2">
								<span
									className="h-2 w-2"
									style={{ backgroundColor: COLORS[index] }}
								/>
								<span className="font-sans text-[12px] text-(--dim)">
									{entry.name}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<div className="border border-(--rule) p-5">
					<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
						// APPLICATION STATUS
					</span>
					<div className="mt-4 h-[250px]">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={appStatusData}
									cx="50%"
									cy="50%"
									innerRadius={60}
									outerRadius={100}
									dataKey="value"
									stroke="none"
								>
									{appStatusData.map((_, index) => (
										<Cell key={`cell-${index}`} fill={COLORS[index + 2]} />
									))}
								</Pie>
								<Tooltip
									contentStyle={{
										background: "#1a1a1a",
										border: "1px solid #2a2a2a",
										borderRadius: 0,
										fontSize: 13,
									}}
								/>
							</PieChart>
						</ResponsiveContainer>
					</div>
					<div className="mt-3 flex justify-center gap-6">
						{appStatusData.map((entry, index) => (
							<div key={entry.name} className="flex items-center gap-2">
								<span
									className="h-2 w-2"
									style={{ backgroundColor: COLORS[index + 2] }}
								/>
								<span className="font-sans text-[12px] text-(--dim)">
									{entry.name}
								</span>
							</div>
						))}
					</div>
				</div>

				<div className="border border-(--rule) p-5">
					<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
						// PLATFORM METRICS
					</span>
					<div className="mt-4 space-y-3">
						<div className="flex items-center justify-between border-b border-(--rule) pb-2">
							<span className="font-sans text-[13px] text-(--dim)">
								Total Users
							</span>
							<span className="font-serif text-lg text-(--on-surface)">
								{stats.users.total.toLocaleString()}
							</span>
						</div>
						<div className="flex items-center justify-between border-b border-(--rule) pb-2">
							<span className="font-sans text-[13px] text-(--dim)">
								Total Companies
							</span>
							<span className="font-serif text-lg text-(--on-surface)">
								{stats.companies.total.toLocaleString()}
							</span>
						</div>
						<div className="flex items-center justify-between border-b border-(--rule) pb-2">
							<span className="font-sans text-[13px] text-(--dim)">
								Open Jobs
							</span>
							<span className="font-serif text-lg text-(--on-surface)">
								{stats.jobs.open.toLocaleString()}
							</span>
						</div>
						<div className="flex items-center justify-between border-b border-(--rule) pb-2">
							<span className="font-sans text-[13px] text-(--dim)">
								Pending Applications
							</span>
							<span className="font-serif text-lg text-(--on-surface)">
								{stats.applications.pending.toLocaleString()}
							</span>
						</div>
						<div className="flex items-center justify-between pb-2">
							<span className="font-sans text-[13px] text-(--dim)">
								Unread Notifications
							</span>
							<span className="font-serif text-lg text-(--on-surface)">
								{stats.notifications.unread.toLocaleString()}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
