import { createFileRoute } from "@tanstack/react-router";
import { CandidateDashboardPage } from "@/features/candidate/pages/CandidateDashboardPage";
import { requireRole } from "@/guards";

export const Route = createFileRoute("/_authenticated/candidate/dashboard")({
	beforeLoad: requireRole(["CANDIDATE"]),
	component: CandidateDashboardPage,
});
