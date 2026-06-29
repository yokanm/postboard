import { createFileRoute } from "@tanstack/react-router";
import { CompanyDashboardPage } from "@/features/company/pages/CompanyDashboardPage";

export const Route = createFileRoute("/_authenticated/company/")({
	component: CompanyDashboardPage,
});
