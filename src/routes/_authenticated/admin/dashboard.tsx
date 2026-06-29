import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboardPage } from "@/features/admin/pages/AdminDashboardPage";
import { requireRole } from "@/guards";

export const Route = createFileRoute("/_authenticated/admin/dashboard")({
	beforeLoad: requireRole(["ADMIN", "SUPERADMIN"]),
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="p-6">
			<AdminDashboardPage />
		</div>
	);
}
