import { createFileRoute } from "@tanstack/react-router";
import { SuperAdminUsersPage } from "@/features/superadmin/pages/SuperAdminUsersPage";

export const Route = createFileRoute("/_superadmin/superadmin/users")({
	component: RouteComponent,
});

function RouteComponent() {
	return <SuperAdminUsersPage />;
}
