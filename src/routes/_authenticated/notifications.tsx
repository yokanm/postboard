import { createFileRoute } from "@tanstack/react-router";
import { NotificationListPage } from "@/features/notifications/pages/NotificationListPage";
import { requireAuth } from "@/guards";

export const Route = createFileRoute("/_authenticated/notifications")({
	beforeLoad: requireAuth,
	component: NotificationListPage,
});
