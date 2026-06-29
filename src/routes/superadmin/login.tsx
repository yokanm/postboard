import { createFileRoute, redirect } from "@tanstack/react-router";
import { SuperAdminLoginPage } from "@/features/superadmin/pages/SuperAdminLoginPage";
import { useSuperAdminAuthStore } from "@/stores";

export const Route = createFileRoute("/superadmin/login")({
	beforeLoad: () => {
		if (typeof window === "undefined") return;
		const { isAuthenticated, isInitialized } =
			useSuperAdminAuthStore.getState();
		if (!isInitialized) return;
		if (isAuthenticated) {
			throw redirect({ to: "/superadmin/dashboard" });
		}
	},
	head: () => ({
		meta: [
			{ title: "SuperAdmin - Postboard" },
			{
				name: "description",
				content: "Postboard platform administration login.",
			},
			{ name: "robots", content: "noindex, nofollow" },
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	return <SuperAdminLoginPage />;
}
