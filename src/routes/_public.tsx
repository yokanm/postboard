import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PublicFooter } from "@/features/public/components/PublicFooter";
import { PublicHeader } from "@/features/public/components/PublicHeader";
import { Breadcrumbs } from "@/shared/components/ux/Breadcrumbs";
import { ErrorState } from "@/shared/components/ux/ErrorState";
import { LoadingState } from "@/shared/components/ux/LoadingState";

export const Route = createFileRoute("/_public")({
	errorComponent: () => (
		<ErrorState message="Something went wrong loading this page." />
	),
	pendingComponent: () => <LoadingState variant="page" message="Loading..." />,
	component: () => (
		<div className="flex min-h-dvh flex-col bg-(--background) pt-16">
			<PublicHeader />
			<Breadcrumbs />
			<Outlet />
			<PublicFooter />
		</div>
	),
});
