import { createFileRoute } from "@tanstack/react-router";
import { CandidateProfilePage } from "@/features/profile/pages/candidate/CandidateProfilePage";
import { requireRole } from "@/guards";

export const Route = createFileRoute("/_authenticated/candidate/profile")({
	beforeLoad: requireRole(["CANDIDATE"]),
	component: CandidateProfilePage,
});
