import { redirect } from "@tanstack/react-router";
import { useSuperAdminAuthStore } from "@/stores";

export function requireSuperAdmin() {
	if (typeof window === "undefined") return;
	const { isAuthenticated, accessToken } = useSuperAdminAuthStore.getState();
	if (!isAuthenticated || !accessToken) {
		throw redirect({ to: "/superadmin/login" });
	}
}
