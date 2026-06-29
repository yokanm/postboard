import { createFileRoute } from "@tanstack/react-router";
import { CompanyProfilePage } from "@/features/company/pages/CompanyProfilePage";
import { requireAuth } from "@/guards";

export const Route = createFileRoute("/_authenticated/company/$companyId")({
	beforeLoad: requireAuth,
	component: CompanyProfileComponent,
});

function CompanyProfileComponent() {
	const { companyId } = Route.useParams();
	return <CompanyProfilePage companyId={companyId} />;
}
