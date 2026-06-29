import { createFileRoute } from "@tanstack/react-router";
import { RecruiterProfilePage } from "@/features/profile/pages/recruiter/RecruiterProfilePage";
import { requireRole } from "@/guards";

export const Route = createFileRoute("/_authenticated/recruiter/profile")({
	beforeLoad: requireRole(["RECRUITER"]),
	component: RecruiterProfilePage,
});
