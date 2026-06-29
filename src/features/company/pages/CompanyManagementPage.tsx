import { CompanyEditForm } from "../components/CompanyEditForm";
import { CompanyLogoUpload } from "../components/CompanyLogoUpload";
import { TeamSection } from "../components/TeamSection";
import { useCurrentCompany } from "../hooks";

export function CompanyManagementPage() {
	const { data, isLoading, isError, error } = useCurrentCompany();

	if (isLoading) {
		return (
			<div className="p-4 sm:p-6">
				<div className="mb-6">
					<span className="mono-label text-(--primary-container)">
						// COMPANY_MANAGEMENT
					</span>
					<h2 className="font-headline text-2xl text-(--on-surface) sm:text-[32px]">
						Company
					</h2>
					<p className="font-sans text-[15px] text-(--body)">Loading...</p>
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="p-4 sm:p-6">
				<div className="mb-6">
					<span className="mono-label text-(--primary-container)">
						// COMPANY_MANAGEMENT
					</span>
					<h2 className="font-headline text-2xl text-(--on-surface) sm:text-[32px]">
						Company
					</h2>
				</div>
				<div className="border border-(--rule) p-4">
					<p className="font-sans text-[15px] text-(--error)">
						{error instanceof Error
							? error.message
							: "You are not associated with any company."}
					</p>
					<p className="mt-2 font-sans text-[13px] text-(--dim)">
						Contact your company administrator to get invited, or ask them to
						create a company account.
					</p>
				</div>
			</div>
		);
	}

	const company = data?.company;

	if (!company) {
		return (
			<div className="p-4 sm:p-6">
				<div className="mb-6">
					<span className="mono-label text-(--primary-container)">
						// COMPANY_MANAGEMENT
					</span>
					<h2 className="font-headline text-2xl text-(--on-surface) sm:text-[32px]">
						Company
					</h2>
				</div>
				<div className="border border-(--rule) p-4">
					<p className="font-sans text-[15px] text-(--dim)">
						No company found.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="p-4 sm:p-6">
			<div className="mb-6">
				<span className="mono-label text-(--primary-container)">
					// COMPANY_MANAGEMENT
				</span>
				<h2 className="font-headline text-2xl text-(--on-surface) sm:text-[32px]">
					{company.name}
				</h2>
				<p className="font-sans text-[15px] text-(--body)">
					Manage your company profile, branding, and team.
				</p>
			</div>

			<div className="flex flex-col gap-6">
				<CompanyLogoUpload logoUrl={company.logoUrl} />

				<div className="border border-(--rule)">
					<div className="border-b border-(--rule) px-4 py-2">
						<span className="mono-label text-(--primary-container)">
							// COMPANY_INFORMATION
						</span>
					</div>
					<div className="p-4">
						<CompanyEditForm company={company} onSuccess={() => {}} />
					</div>
				</div>

				<TeamSection />
			</div>
		</div>
	);
}
