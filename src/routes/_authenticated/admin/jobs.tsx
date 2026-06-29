import { createFileRoute } from "@tanstack/react-router";
import { AdminJobsPage } from "@/features/admin/pages/AdminJobsPage";
import { requireRole } from "@/guards";

export const Route = createFileRoute("/_authenticated/admin/jobs")({
	beforeLoad: requireRole(["ADMIN", "SUPERADMIN"]),
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="p-6">
			<AdminJobsPage />
		</div>
	);
}
