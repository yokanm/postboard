import { createFileRoute } from "@tanstack/react-router";
import { SuperAdminJobsPage } from "@/features/superadmin/pages/SuperAdminJobsPage";

export const Route = createFileRoute("/_superadmin/superadmin/jobs")({
	component: SuperAdminJobsPage,
});
