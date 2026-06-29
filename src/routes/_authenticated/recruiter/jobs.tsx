import { createFileRoute } from "@tanstack/react-router";
import { RecruiterJobManagement } from "@/features/jobs/components/RecruiterJobManagement";
import { requireRole } from "@/guards";

export const Route = createFileRoute("/_authenticated/recruiter/jobs")({
	beforeLoad: requireRole(["RECRUITER"]),
	component: RecruiterJobManagement,
});
