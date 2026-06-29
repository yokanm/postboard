import { createFileRoute } from "@tanstack/react-router";
import { CompanyAdminProfilePage } from "@/features/company/pages/CompanyAdminProfilePage";

export const Route = createFileRoute("/_authenticated/company/profile")({
	component: CompanyAdminProfilePage,
});
