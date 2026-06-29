import { createFileRoute } from "@tanstack/react-router";
import { CompanyTeamPage } from "@/features/company/pages/CompanyTeamPage";

export const Route = createFileRoute("/_authenticated/company/team")({
	component: CompanyTeamPage,
});
