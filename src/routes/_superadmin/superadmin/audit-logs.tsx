import { createFileRoute } from "@tanstack/react-router";
import { SuperAdminAuditLogsPage } from "@/features/superadmin/pages/SuperAdminAuditLogsPage";

export const Route = createFileRoute("/_superadmin/superadmin/audit-logs")({
	component: RouteComponent,
});

function RouteComponent() {
	return <SuperAdminAuditLogsPage />;
}
