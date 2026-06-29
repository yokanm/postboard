import { createFileRoute } from "@tanstack/react-router";
import { AdminCompaniesPage } from "@/features/admin/pages/AdminCompaniesPage";
import { requireRole } from "@/guards";

export const Route = createFileRoute("/_authenticated/admin/companies")({
	beforeLoad: requireRole(["ADMIN", "SUPERADMIN"]),
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="p-6">
			<AdminCompaniesPage />
		</div>
	);
}
