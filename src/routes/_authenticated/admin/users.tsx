import { createFileRoute } from "@tanstack/react-router";
import { AdminUsersPage } from "@/features/admin/pages/AdminUsersPage";
import { requireRole } from "@/guards";

export const Route = createFileRoute("/_authenticated/admin/users")({
	beforeLoad: requireRole(["ADMIN", "SUPERADMIN"]),
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="p-6">
			<AdminUsersPage />
		</div>
	);
}
