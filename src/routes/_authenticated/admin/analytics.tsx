import { createFileRoute } from "@tanstack/react-router";
import { AdminAnalyticsPage } from "@/features/admin/pages/AdminAnalyticsPage";
import { requireRole } from "@/guards";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
	beforeLoad: requireRole(["ADMIN", "SUPERADMIN"]),
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="p-6">
			<AdminAnalyticsPage />
		</div>
	);
}
