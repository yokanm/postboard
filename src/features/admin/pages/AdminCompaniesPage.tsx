import { CompanyTable } from "../components/companies/CompanyTable";

export function AdminCompaniesPage() {
	return (
		<div className="space-y-6">
			<div>
				<div className="mono-label mb-4 text-[11px] uppercase tracking-[0.05em] text-(--dim)">
					// COMPANY MANAGEMENT
				</div>
				<CompanyTable />
			</div>
		</div>
	);
}
