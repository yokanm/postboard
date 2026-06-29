import { redirect } from "@tanstack/react-router";
import type { UserRole } from "@/shared/types/api";
import { useAuthStore, useSuperAdminAuthStore } from "@/stores";

export function getDefaultDashboardByRole(
	role: UserRole | null | undefined,
): string {
	switch (role) {
		case "SUPERADMIN":
			return "/superadmin/dashboard";
		case "ADMIN":
			return "/admin/dashboard";
		case "RECRUITER":
			return "/recruiter/dashboard";
		case "CANDIDATE":
			return "/candidate/dashboard";
		default:
			return "/login";
	}
}

export function requireAuth() {
	if (typeof window === "undefined") return;
	const { isAuthenticated, accessToken, isInitialized } =
		useAuthStore.getState();
	if (!isInitialized) return;
	if (!isAuthenticated || !accessToken) {
		throw redirect({ to: "/login" });
	}
}

export function requireRole(allowedRoles: UserRole[]) {
	return () => {
		if (typeof window === "undefined") return;
		requireAuth();

		const { role, isInitialized } = useAuthStore.getState();
		if (!isInitialized) return;
		if (!role) {
			throw redirect({ to: "/login" });
		}
		if (!allowedRoles.includes(role)) {
			throw redirect({ to: getDefaultDashboardByRole(role) });
		}
	};
}

export function redirectIfAuthenticated() {
	if (typeof window === "undefined") return;
	const { role, isAuthenticated, isInitialized } = useAuthStore.getState();
	const sa = useSuperAdminAuthStore.getState();
	if (sa.isAuthenticated && sa.admin) {
		throw redirect({ to: "/superadmin/dashboard" });
	}
	if (!isInitialized) return;
	if (isAuthenticated && role) {
		throw redirect({ to: getDefaultDashboardByRole(role) });
	}
}
