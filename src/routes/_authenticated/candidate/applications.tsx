import { createFileRoute } from "@tanstack/react-router";
import { CandidateApplicationsPage } from "@/features/applications/pages/candidate/CandidateApplicationsPage";
import { requireRole } from "@/guards";

export const Route = createFileRoute("/_authenticated/candidate/applications")({
	beforeLoad: requireRole(["CANDIDATE"]),
	component: CandidateApplicationsPage,
});
