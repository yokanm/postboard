import { createFileRoute } from "@tanstack/react-router";
import { SuperAdminDashboardPage } from "@/features/superadmin/pages/SuperAdminDashboardPage";

export const Route = createFileRoute("/_superadmin/superadmin/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	return <SuperAdminDashboardPage />;
}
