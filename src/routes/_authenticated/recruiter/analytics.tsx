import { createFileRoute } from "@tanstack/react-router";
import { RecruiterAnalyticsPage } from "@/features/recruiter/pages/RecruiterAnalyticsPage";
import { requireRole } from "@/guards";

export const Route = createFileRoute("/_authenticated/recruiter/analytics")({
	beforeLoad: requireRole(["RECRUITER"]),
	component: RecruiterAnalyticsPage,
});
