import { createFileRoute } from "@tanstack/react-router";
import { PublicCompanyProfilePage } from "@/features/public/pages/PublicCompanyProfilePage";

function CompanyDetailComponent() {
	const { companyId } = Route.useParams();
	return <PublicCompanyProfilePage companyId={companyId} />;
}

export const Route = createFileRoute("/_public/companies/$companyId")({
	head: () => ({
		meta: [
			{ title: "Company Profile - Postboard" },
			{
				name: "description",
				content: "View company profile, open positions, and more on Postboard.",
			},
		],
	}),
	component: CompanyDetailComponent,
});
