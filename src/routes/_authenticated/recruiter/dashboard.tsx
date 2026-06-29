import { createFileRoute } from "@tanstack/react-router";
import { RecruiterDashboardPage } from "@/features/recruiter/pages/RecruiterDashboardPage";
import { requireRole } from "@/guards";

export const Route = createFileRoute("/_authenticated/recruiter/dashboard")({
	beforeLoad: requireRole(["RECRUITER"]),
	component: RecruiterDashboardPage,
});
