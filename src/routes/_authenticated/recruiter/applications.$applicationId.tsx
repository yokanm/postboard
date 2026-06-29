import { createFileRoute } from "@tanstack/react-router";
import { RecruiterApplicationDetailPage } from "@/features/recruiter/pages/RecruiterApplicationDetailPage";
import { requireRole } from "@/guards";

export const Route = createFileRoute(
	"/_authenticated/recruiter/applications/$applicationId",
)({
	beforeLoad: requireRole(["RECRUITER"]),
	validateSearch: (search: Record<string, string | undefined>) => ({
		jobId: search.jobId,
	}),
	component: ApplicationDetailComponent,
});

function ApplicationDetailComponent() {
	const { applicationId } = Route.useParams();
	const { jobId } = Route.useSearch();
	return (
		<RecruiterApplicationDetailPage
			applicationId={applicationId}
			jobId={jobId}
		/>
	);
}
