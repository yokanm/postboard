import { createFileRoute } from "@tanstack/react-router";
import { CompanyAnalyticsPage } from "@/features/company/pages/CompanyAnalyticsPage";

export const Route = createFileRoute("/_authenticated/company/analytics")({
	component: CompanyAnalyticsPage,
});
