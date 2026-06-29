import {
	ActivityIcon,
	Briefcase01Icon,
	File01Icon,
	UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCurrentUser } from "@/features/auth/hooks";
import { ErrorState } from "@/shared/components/ux/ErrorState";
import { LoadingState } from "@/shared/components/ux/LoadingState";
import { useCompanyAnalytics, useCurrentCompany } from "../hooks";

export function CompanyDashboardPage() {
	const { data: user } = useCurrentUser();
	const {
		data: companyResp,
		isLoading,
		isError,
		refetch,
	} = useCurrentCompany();
	const { data: analytics, isLoading: analyticsLoading } =
		useCompanyAnalytics();

	if (isLoading) {
		return (
			<LoadingState variant="page" message="Loading company dashboard..." />
		);
	}

	if (isError) {
		return (
			<div className="p-4 sm:p-6">
				<ErrorState
					message="Could not load company details. You may not be associated with a company."
					onRetry={() => refetch()}
				/>
			</div>
		);
	}

	const company = companyResp?.company;
	if (!company) {
		return (
			<div className="p-4 sm:p-6">
				<ErrorState message="No company found. Contact your administrator." />
			</div>
		);
	}

	const stats = [
		{
			label: "Active Jobs",
			value: analytics?.activeJobs ?? company._count?.jobs ?? 0,
			icon: Briefcase01Icon,
		},
		{
			label: "Applications",
			value: analytics?.totalApplications ?? 0,
			icon: File01Icon,
		},
		{
			label: "Team Members",
			value: analytics?.totalRecruiters ?? company._count?.users ?? 0,
			icon: UserGroupIcon,
		},
		{
			label: "Recent Activity",
			value: analytics?.recentApplications?.length ?? 0,
			icon: ActivityIcon,
		},
	];

	return (
		<div className="flex flex-col gap-6 p-4 sm:p-6">
			<div className="flex flex-col gap-1">
				<span className="mono-label text-(--primary-container)">
					// COMPANY_DASHBOARD
				</span>
				<h1 className="font-headline m-0 text-(--on-surface) text-[24px] sm:text-[32px]">
					{company.name}
				</h1>
				<p className="font-sans text-[14px] text-(--body)">
					Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
				</p>
			</div>

			<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
				{stats.map((stat) => (
					<div key={stat.label} className="border border-(--rule) p-4">
						<div className="flex items-center gap-2">
							<HugeiconsIcon
								icon={stat.icon}
								strokeWidth={2}
								className="h-4 w-4 text-(--primary-container)"
								aria-hidden="true"
							/>
							<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
								{stat.label}
							</span>
						</div>
						<p className="font-headline mt-2 text-[28px] text-(--on-surface)">
							{analyticsLoading ? "..." : stat.value}
						</p>
					</div>
				))}
			</div>

			<div className="border border-(--rule)">
				<div className="border-b border-(--rule) px-4 py-2">
					<span className="mono-label text-(--primary-container)">
						// COMPANY_INFO
					</span>
				</div>
				<div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
					<div>
						<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
							Company ID
						</span>
						<p className="font-sans text-[13px] text-(--on-surface) font-mono">
							{company.id}
						</p>
					</div>
					<div>
						<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
							Email
						</span>
						<p className="font-sans text-[13px] text-(--on-surface)">
							{company.email}
						</p>
					</div>
					<div>
						<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
							Industry
						</span>
						<p className="font-sans text-[13px] text-(--on-surface)">
							{company.industry ?? "Not set"}
						</p>
					</div>
					<div>
						<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
							Verification
						</span>
						<p
							className={`font-sans text-[13px] ${company.isVerified ? "text-(--live)" : "text-(--warning)"}`}
						>
							{company.isVerified ? "Verified" : "Not verified"}
						</p>
					</div>
					<div>
						<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
							Company Size
						</span>
						<p className="font-sans text-[13px] text-(--on-surface)">
							{company.size ?? "Not set"}
						</p>
					</div>
					<div>
						<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
							Created
						</span>
						<p className="font-sans text-[13px] text-(--on-surface)">
							{new Date(company.createdAt).toLocaleDateString()}
						</p>
					</div>
				</div>
			</div>

			{company.logoUrl && (
				<div className="border border-(--rule) p-4">
					<span className="mono-label mb-2 block text-[11px] uppercase tracking-[0.05em] text-(--primary-container)">
						// COMPANY_LOGO
					</span>
					<img
						src={company.logoUrl}
						alt={`${company.name} logo`}
						className="h-16 w-16 border border-(--rule) object-contain"
					/>
				</div>
			)}
		</div>
	);
}
