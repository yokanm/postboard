import { useCurrentUser } from "@/features/auth/hooks";
import { useCompanyDetail } from "../hooks";
import type { JobDetailCompany } from "../types";

interface CompanyProfilePageProps {
	companyId: string;
	initialCompany?: JobDetailCompany | null;
}

export function CompanyProfilePage({
	companyId,
	initialCompany,
}: CompanyProfilePageProps) {
	const { data: user } = useCurrentUser();
	const { data, isLoading, isError } = useCompanyDetail(companyId);

	const company = data?.company;

	const displayName = company?.name ?? initialCompany?.name ?? "Company";
	const displayLogo = company?.logoUrl ?? initialCompany?.logoUrl;
	const displayWebsite = company?.website ?? initialCompany?.website;
	const displayIndustry = company?.industry ?? initialCompany?.industry;
	const jobCount = company?._count?.jobs;
	const memberCount = company?._count?.users;
	const displaySize = company?.size;
	const displayEmail = company?.email;

	if (!user?.companyId && !initialCompany) {
		return (
			<div className="p-4 sm:p-6">
				<div className="mb-6">
					<span className="mono-label text-(--primary-container)">
						// COMPANY_PROFILE
					</span>
					<h2 className="font-headline text-2xl text-(--on-surface) sm:text-[32px]">
						{displayName}
					</h2>
				</div>
				<div className="border border-(--rule) p-4">
					<p className="font-sans text-[15px] text-(--dim)">
						Company profile requires authentication. Please log in to view
						company details.
					</p>
					{initialCompany && (
						<div className="mt-4 flex flex-col gap-2">
							{displayIndustry && (
								<p className="font-sans text-[13px] text-(--body)">
									Industry: {displayIndustry}
								</p>
							)}
							{displayWebsite && (
								<a
									href={displayWebsite}
									target="_blank"
									rel="noopener noreferrer"
									className="font-sans text-[13px] text-(--primary) underline underline-offset-2"
								>
									{displayWebsite}
								</a>
							)}
						</div>
					)}
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="p-4 sm:p-6">
				<span className="mono-label text-(--primary-container)">
					// COMPANY_PROFILE
				</span>
				<h2 className="font-headline text-2xl text-(--on-surface) sm:text-[32px]">
					Loading...
				</h2>
			</div>
		);
	}

	return (
		<div className="p-4 sm:p-6">
			<div className="mb-6">
				<span className="mono-label text-(--primary-container)">
					// COMPANY_PROFILE
				</span>
				<h2 className="font-headline text-2xl text-(--on-surface) sm:text-[32px]">
					{displayName}
				</h2>
			</div>

			{isError && !company && (
				<div className="border border-(--rule) p-4">
					<p className="font-sans text-[15px] text-(--error)">
						Could not load company details.
					</p>
				</div>
			)}

			<div className="flex flex-col gap-6">
				{displayLogo && (
					<div className="border border-(--rule) p-4">
						<img
							src={displayLogo}
							alt={`${displayName} logo`}
							className="h-16 w-16 border border-(--rule) object-contain"
						/>
					</div>
				)}

				<div className="border border-(--rule)">
					<div className="border-b border-(--rule) px-4 py-2">
						<span className="mono-label text-(--primary-container)">
							// COMPANY_INFO
						</span>
					</div>
					<div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
						{displayEmail && (
							<div>
								<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
									Email
								</span>
								<p className="font-sans text-[13px] text-(--on-surface)">
									{displayEmail}
								</p>
							</div>
						)}
						{displayIndustry && (
							<div>
								<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
									Industry
								</span>
								<p className="font-sans text-[13px] text-(--on-surface)">
									{displayIndustry}
								</p>
							</div>
						)}
						{displaySize && (
							<div>
								<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
									Size
								</span>
								<p className="font-sans text-[13px] text-(--on-surface)">
									{displaySize} employees
								</p>
							</div>
						)}
						{displayWebsite && (
							<div>
								<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
									Website
								</span>
								<a
									href={displayWebsite}
									target="_blank"
									rel="noopener noreferrer"
									className="font-sans text-[13px] text-(--primary) underline underline-offset-2"
								>
									{displayWebsite}
								</a>
							</div>
						)}
					</div>
				</div>

				{(jobCount !== undefined || memberCount !== undefined) && (
					<div className="border border-(--rule)">
						<div className="border-b border-(--rule) px-4 py-2">
							<span className="mono-label text-(--primary-container)">
								// STATISTICS
							</span>
						</div>
						<div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3">
							{jobCount !== undefined && (
								<div>
									<span className="font-headline text-[24px] text-(--on-surface)">
										{jobCount}
									</span>
									<p className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
										Active Jobs
									</p>
								</div>
							)}
							{memberCount !== undefined && (
								<div>
									<span className="font-headline text-[24px] text-(--on-surface)">
										{memberCount}
									</span>
									<p className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
										Team Members
									</p>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
