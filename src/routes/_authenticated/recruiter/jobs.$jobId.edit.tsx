import { createFileRoute } from "@tanstack/react-router";
import { EditJobPage } from "@/features/jobs/components/EditJobPage";
import { requireRole } from "@/guards";

export const Route = createFileRoute(
	"/_authenticated/recruiter/jobs/$jobId/edit",
)({
	beforeLoad: requireRole(["RECRUITER"]),
	component: EditJobComponent,
});

function EditJobComponent() {
	const { jobId } = Route.useParams();
	return <EditJobPage jobId={jobId} />;
}
