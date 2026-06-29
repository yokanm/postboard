import { createFileRoute } from "@tanstack/react-router";
import { SuperAdminPlatformPage } from "@/features/superadmin/pages/SuperAdminPlatformPage";

export const Route = createFileRoute("/_superadmin/superadmin/platform")({
	component: RouteComponent,
});

function RouteComponent() {
	return <SuperAdminPlatformPage />;
}
