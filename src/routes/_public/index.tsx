import { createFileRoute, redirect } from "@tanstack/react-router";
import { LandingPage } from "@/features/public/pages/LandingPage";
import { getDefaultDashboardByRole } from "@/guards";
import { useAuthStore } from "@/stores";

export const Route = createFileRoute("/_public/")({
	beforeLoad() {
		if (typeof window === "undefined") return;
		const { role, isAuthenticated } = useAuthStore.getState();
		if (isAuthenticated && role) {
			throw redirect({ to: getDefaultDashboardByRole(role) });
		}
	},
	head: () => ({
		meta: [
			{ title: "Postboard - Find Jobs, Hire Talent, Build Careers" },
			{
				name: "description",
				content:
					"Discover jobs from verified companies and connect with recruiters actively hiring. A high-density pipeline for technical talent.",
			},
			{
				property: "og:title",
				content: "Postboard - Find Jobs, Hire Talent, Build Careers",
			},
			{
				property: "og:description",
				content:
					"Discover jobs from verified companies and connect with recruiters actively hiring.",
			},
			{ property: "og:image", content: "/og-image.png" },
			{
				name: "twitter:title",
				content: "Postboard - Find Jobs, Hire Talent, Build Careers",
			},
			{
				name: "twitter:description",
				content:
					"Discover jobs from verified companies and connect with recruiters actively hiring.",
			},
		],
	}),
	pendingComponent: () => (
		<div className="flex min-h-dvh items-center justify-center bg-(--background)" />
	),
	component: LandingPage,
});
