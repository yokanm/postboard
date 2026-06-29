import { createFileRoute } from "@tanstack/react-router";
import { CompanyManagementPage } from "@/features/company/pages/CompanyManagementPage";
import { requireRole } from "@/guards";

export const Route = createFileRoute("/_authenticated/recruiter/company")({
	beforeLoad: requireRole(["RECRUITER"]),
	component: CompanyManagementPage,
});
