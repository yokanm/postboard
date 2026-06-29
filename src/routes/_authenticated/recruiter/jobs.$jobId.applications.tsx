import { createFileRoute } from "@tanstack/react-router";
import { RecruiterApplicantPipelinePage } from "@/features/applications/pages/recruiter/RecruiterApplicantPipelinePage";
import { requireRole } from "@/guards";

export const Route = createFileRoute(
	"/_authenticated/recruiter/jobs/$jobId/applications",
)({
	beforeLoad: requireRole(["RECRUITER"]),
	component: ApplicantPipelineComponent,
});

function ApplicantPipelineComponent() {
	const { jobId } = Route.useParams();
	return <RecruiterApplicantPipelinePage jobId={jobId} />;
}
