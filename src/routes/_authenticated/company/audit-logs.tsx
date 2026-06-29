import { createFileRoute } from "@tanstack/react-router";
import { CompanyAuditLogsPage } from "@/features/company/pages/CompanyAuditLogsPage";

export const Route = createFileRoute("/_authenticated/company/audit-logs")({
	component: CompanyAuditLogsPage,
});
