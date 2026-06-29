import { createFileRoute } from "@tanstack/react-router";
import { RecruiterJobDetailPage } from "@/features/recruiter/pages/RecruiterJobDetailPage";
import { requireRole } from "@/guards";

export const Route = createFileRoute("/_authenticated/recruiter/jobs/$jobId")({
	beforeLoad: requireRole(["RECRUITER"]),
	component: JobDetailComponent,
});

function JobDetailComponent() {
	const { jobId } = Route.useParams();
	return <RecruiterJobDetailPage jobId={jobId} />;
}
