import {
	Briefcase01Icon,
	File01Icon,
	UserGroupIcon,
	UserMultipleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { lazy, Suspense } from "react";
import { ErrorState } from "@/shared/components/ux/ErrorState";
import { LoadingState } from "@/shared/components/ux/LoadingState";
import { useCompanyAnalytics } from "../hooks";

const BarChart = lazy(() =>
	import("recharts").then((m) => ({ default: m.BarChart })),
);
const Bar = lazy(() => import("recharts").then((m) => ({ default: m.Bar })));
const XAxis = lazy(() =>
	import("recharts").then((m) => ({ default: m.XAxis })),
);
const YAxis = lazy(() =>
	import("recharts").then((m) => ({ default: m.YAxis })),
);
const CartesianGrid = lazy(() =>
	import("recharts").then((m) => ({ default: m.CartesianGrid })),
);
const Tooltip = lazy(() =>
	import("recharts").then((m) => ({ default: m.Tooltip })),
);
const ResponsiveContainer = lazy(() =>
	import("recharts").then((m) => ({ default: m.ResponsiveContainer })),
);
const PieChart = lazy(() =>
	import("recharts").then((m) => ({ default: m.PieChart })),
);
const Pie = lazy(() => import("recharts").then((m) => ({ default: m.Pie })));
const Cell = lazy(() => import("recharts").then((m) => ({ default: m.Cell })));
const Legend = lazy(() =>
	import("recharts").then((m) => ({ default: m.Legend })),
);

const STATUS_COLORS = [
	"var(--primary-container)",
	"var(--live)",
	"var(--warning)",
	"var(--destructive)",
	"var(--muted)",
];

export function CompanyAnalyticsPage() {
	const { data, isLoading, isError, refetch } = useCompanyAnalytics();

	if (isLoading) {
		return <LoadingState variant="page" message="Loading analytics..." />;
	}

	if (isError) {
		return (
			<div className="p-4 sm:p-6">
				<ErrorState
					message="Failed to load analytics"
					onRetry={() => refetch()}
				/>
			</div>
		);
	}

	if (!data) {
		return (
			<div className="p-4 sm:p-6">
				<ErrorState message="No analytics data available" />
			</div>
		);
	}

	const overviewItems = [
		{ label: "Active Jobs", value: data.activeJobs, icon: Briefcase01Icon },
		{
			label: "Total Applications",
			value: data.totalApplications,
			icon: File01Icon,
		},
		{ label: "Recruiters", value: data.totalRecruiters, icon: UserGroupIcon },
		{
			label: "Candidates",
			value: data.totalCandidates,
			icon: UserMultipleIcon,
		},
	];

	return (
		<div className="flex flex-col gap-6 p-4 sm:p-6">
			<div className="flex flex-col gap-1">
				<span className="mono-label text-(--primary-container)">
					// ANALYTICS
				</span>
				<h1 className="font-headline m-0 text-(--on-surface) text-[24px] sm:text-[32px]">
					Analytics
				</h1>
				<p className="font-sans text-[14px] text-(--body)">
					Company performance and hiring metrics.
				</p>
			</div>

			<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
				{overviewItems.map((item) => (
					<div key={item.label} className="border border-(--rule) p-4">
						<div className="flex items-center gap-2">
							<HugeiconsIcon
								icon={item.icon}
								strokeWidth={2}
								className="h-4 w-4 text-(--primary-container)"
								aria-hidden="true"
							/>
							<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
								{item.label}
							</span>
						</div>
						<p className="font-headline mt-2 text-[28px] text-(--on-surface)">
							{item.value}
						</p>
					</div>
				))}
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				{data.recentApplications.length > 0 && (
					<div className="border border-(--rule) p-4">
						<span className="mono-label mb-4 block text-[11px] uppercase tracking-[0.05em] text-(--primary-container)">
							// RECENT APPLICATIONS
						</span>
						<Suspense fallback={<LoadingState message="Loading chart..." />}>
							<ResponsiveContainer width="100%" height={240}>
								<BarChart data={data.recentApplications}>
									<CartesianGrid stroke="var(--rule)" strokeDasharray="3 3" />
									<XAxis
										dataKey="date"
										tick={{ fontSize: 11, fill: "var(--dim)" }}
									/>
									<YAxis tick={{ fontSize: 11, fill: "var(--dim)" }} />
									<Tooltip
										contentStyle={{
											borderRadius: 0,
											border: "1px solid var(--rule)",
											background: "var(--surface-container-lowest)",
											color: "var(--on-surface)",
											fontSize: "13px",
										}}
									/>
									<Bar
										dataKey="count"
										fill="var(--primary-container)"
										radius={0}
									/>
								</BarChart>
							</ResponsiveContainer>
						</Suspense>
					</div>
				)}

				{data.statusDistribution.length > 0 && (
					<div className="border border-(--rule) p-4">
						<span className="mono-label mb-4 block text-[11px] uppercase tracking-[0.05em] text-(--primary-container)">
							// STATUS DISTRIBUTION
						</span>
						<Suspense fallback={<LoadingState message="Loading chart..." />}>
							<ResponsiveContainer width="100%" height={240}>
								<PieChart>
									<Pie
										data={data.statusDistribution}
										dataKey="count"
										nameKey="status"
										cx="50%"
										cy="50%"
										outerRadius={80}
										stroke="none"
									>
										{data.statusDistribution.map((_, idx) => (
											<Cell
												key={idx}
												fill={STATUS_COLORS[idx % STATUS_COLORS.length]}
											/>
										))}
									</Pie>
									<Tooltip
										contentStyle={{
											borderRadius: 0,
											border: "1px solid var(--rule)",
											background: "var(--surface-container-lowest)",
											fontSize: "13px",
										}}
									/>
									<Legend
										wrapperStyle={{ fontSize: "11px", color: "var(--dim)" }}
									/>
								</PieChart>
							</ResponsiveContainer>
						</Suspense>
					</div>
				)}

				{data.hiringTrend.length > 0 && (
					<div className="border border-(--rule) p-4 lg:col-span-2">
						<span className="mono-label mb-4 block text-[11px] uppercase tracking-[0.05em] text-(--primary-container)">
							// HIRING TREND
						</span>
						<Suspense fallback={<LoadingState message="Loading chart..." />}>
							<ResponsiveContainer width="100%" height={240}>
								<BarChart data={data.hiringTrend}>
									<CartesianGrid stroke="var(--rule)" strokeDasharray="3 3" />
									<XAxis
										dataKey="month"
										tick={{ fontSize: 11, fill: "var(--dim)" }}
									/>
									<YAxis tick={{ fontSize: 11, fill: "var(--dim)" }} />
									<Tooltip
										contentStyle={{
											borderRadius: 0,
											border: "1px solid var(--rule)",
											background: "var(--surface-container-lowest)",
											fontSize: "13px",
										}}
									/>
									<Bar dataKey="hires" fill="var(--live)" radius={0} />
								</BarChart>
							</ResponsiveContainer>
						</Suspense>
					</div>
				)}
			</div>

			{data.recentApplications.length === 0 &&
				data.statusDistribution.length === 0 &&
				data.hiringTrend.length === 0 && (
					<div className="border border-(--rule) p-8 text-center">
						<p className="font-sans text-[14px] text-(--dim)">
							No analytics data available yet. Data will appear as your company
							starts receiving applications.
						</p>
					</div>
				)}
		</div>
	);
}
