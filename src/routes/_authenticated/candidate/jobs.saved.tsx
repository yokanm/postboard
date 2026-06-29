import { createFileRoute } from "@tanstack/react-router";
import { SavedJobsPage } from "@/features/jobs/components/SavedJobsPage";
import { requireRole } from "@/guards";

export const Route = createFileRoute("/_authenticated/candidate/jobs/saved")({
	beforeLoad: requireRole(["CANDIDATE"]),
	component: SavedJobsPage,
});
