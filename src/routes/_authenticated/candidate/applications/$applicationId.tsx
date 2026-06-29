import { createFileRoute } from "@tanstack/react-router";
import { CandidateApplicationDetailPage } from "@/features/applications/pages/candidate/CandidateApplicationDetailPage";
import { requireRole } from "@/guards";

export const Route = createFileRoute(
	"/_authenticated/candidate/applications/$applicationId",
)({
	beforeLoad: requireRole(["CANDIDATE"]),
	component: ApplicationDetailComponent,
});

function ApplicationDetailComponent() {
	const { applicationId } = Route.useParams();
	return <CandidateApplicationDetailPage applicationId={applicationId} />;
}
