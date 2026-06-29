import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SuperAdminLayout } from "@/features/superadmin/layout/SuperAdminLayout";
import { requireSuperAdmin } from "@/guards/superadmin-guard";
import { ErrorState } from "@/shared/components/ux/ErrorState";
import { LoadingState } from "@/shared/components/ux/LoadingState";

export const Route = createFileRoute("/_superadmin")({
	beforeLoad: requireSuperAdmin,
	errorComponent: () => (
		<ErrorState message="Something went wrong loading this admin page." />
	),
	pendingComponent: () => (
		<LoadingState variant="page" message="Loading admin panel..." />
	),
	component: () => (
		<SuperAdminLayout>
			<Outlet />
		</SuperAdminLayout>
	),
});
