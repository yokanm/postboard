import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/candidate/jobs")({
	beforeLoad() {
		throw redirect({ to: "/jobs", search: {} });
	},
});
