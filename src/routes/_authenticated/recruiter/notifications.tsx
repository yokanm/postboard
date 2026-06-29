import { createFileRoute } from "@tanstack/react-router";
import { RecruiterNotificationsPage } from "@/features/recruiter/pages/RecruiterNotificationsPage";
import { requireRole } from "@/guards";

export const Route = createFileRoute("/_authenticated/recruiter/notifications")(
	{
		beforeLoad: requireRole(["RECRUITER"]),
		component: RecruiterNotificationsPage,
	},
);
