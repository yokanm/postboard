import { createFileRoute } from "@tanstack/react-router";
import { CompanyNotificationsPage } from "@/features/company/pages/CompanyNotificationsPage";

export const Route = createFileRoute("/_authenticated/company/notifications")({
	component: CompanyNotificationsPage,
});
