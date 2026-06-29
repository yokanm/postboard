import { createFileRoute } from "@tanstack/react-router";
import { SuperAdminSecurityPage } from "@/features/superadmin/pages/SuperAdminSecurityPage";

export const Route = createFileRoute("/_superadmin/superadmin/security")({
	component: RouteComponent,
});

function RouteComponent() {
	return <SuperAdminSecurityPage />;
}
