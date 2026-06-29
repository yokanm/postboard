import { createFileRoute } from "@tanstack/react-router";
import { CreateJobPage } from "@/features/jobs/components/CreateJobPage";
import { requireRole } from "@/guards";

export const Route = createFileRoute("/_authenticated/recruiter/jobs/create")({
	beforeLoad: requireRole(["RECRUITER"]),
	component: CreateJobPage,
});
