import { createFileRoute } from "@tanstack/react-router";
import { JobDetailPage } from "@/features/jobs/components/JobDetailPage";

export const Route = createFileRoute("/_public/jobs/$jobId")({
	head: () => ({
		meta: [
			{ title: "Job Detail - Postboard" },
			{
				name: "description",
				content:
					"View detailed job information, responsibilities, requirements, and apply for this position on Postboard.",
			},
			{
				property: "og:title",
				content: "Job Detail - Postboard",
			},
			{
				property: "og:description",
				content:
					"View detailed job information and apply for this position on Postboard.",
			},
			{
				name: "twitter:title",
				content: "Job Detail - Postboard",
			},
			{
				name: "twitter:description",
				content:
					"View detailed job information and apply for this position on Postboard.",
			},
		],
	}),
	component: JobDetailComponent,
});

function JobDetailComponent() {
	const { jobId } = Route.useParams();
	return <JobDetailPage jobId={jobId} />;
}
