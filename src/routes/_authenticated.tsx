import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { requireAuth } from "@/guards";
import { ErrorState } from "@/shared/components/ux/ErrorState";
import { LoadingState } from "@/shared/components/ux/LoadingState";

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: requireAuth,
	errorComponent: () => (
		<ErrorState message="Something went wrong loading this page. Please try again." />
	),
	pendingComponent: () => <LoadingState variant="page" message="Loading..." />,
	component: () => (
		<AppShell>
			<Outlet />
		</AppShell>
	),
});
