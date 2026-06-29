import { createFileRoute } from "@tanstack/react-router";
import { SuperAdminCompaniesPage } from "@/features/superadmin/pages/SuperAdminCompaniesPage";

export const Route = createFileRoute("/_superadmin/superadmin/companies")({
	component: RouteComponent,
});

function RouteComponent() {
	return <SuperAdminCompaniesPage />;
}
