import { createFileRoute, Outlet } from "@tanstack/react-router";
import { CompanyLayout } from "@/features/company/layout/CompanyLayout";
import { requireRole } from "@/guards";

export const Route = createFileRoute("/_authenticated/company")({
	beforeLoad: requireRole(["RECRUITER", "ADMIN"]),
	component: CompanyRoute,
});

function CompanyRoute() {
	return (
		<CompanyLayout>
			<Outlet />
		</CompanyLayout>
	);
}
