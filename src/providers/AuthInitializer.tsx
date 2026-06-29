import { type ReactNode, useEffect } from "react";
import { apiFetch } from "#/shared/api/client";
import type { CurrentUser, RefreshTokenResponse } from "#/shared/types/api";
import { useAuthStore } from "#/stores/auth-store";
import { useSuperAdminAuthStore } from "#/stores/superadmin-auth-store";

interface AuthInitializerProps {
	children: ReactNode;
}

export function AuthInitializer({ children }: AuthInitializerProps) {
	const isInitialized = useAuthStore((s) => s.isInitialized);
	const setUser = useAuthStore((s) => s.setUser);
	const setAccessToken = useAuthStore((s) => s.setAccessToken);
	const clearAuth = useAuthStore((s) => s.clearAuth);
	const setInitialized = useAuthStore((s) => s.setInitialized);

	const saIsInitialized = useSuperAdminAuthStore((s) => s.isInitialized);
	const saSetAccessToken = useSuperAdminAuthStore((s) => s.setAccessToken);
	const saSetAdmin = useSuperAdminAuthStore((s) => s.setAdmin);
	const saClearAuth = useSuperAdminAuthStore((s) => s.clearAuth);
	const saSetInitialized = useSuperAdminAuthStore((s) => s.setInitialized);

	useEffect(() => {
		async function restoreSession() {
			try {
				// Attempt to refresh the access token using the httpOnly cookie
				const data = await apiFetch<RefreshTokenResponse>(
					"/auth/refresh-token",
					{
						method: "POST",
					},
				);
				const { accessToken } = data;
				setAccessToken(accessToken);

				// Fetch current user
				const userData = await apiFetch<{ user: CurrentUser }>(
					"/user/current",
					{
						headers: { Authorization: `Bearer ${accessToken}` },
					},
				);
				setUser(userData.user);
			} catch {
				clearAuth();
			}
		}

		async function restoreSuperAdminSession() {
			try {
				const data = await apiFetch<{
					accessToken: string;
					admin: {
						id: string;
						email: string;
						firstName: string;
						lastName: string;
					};
				}>("/superadmin/refresh", {
					method: "POST",
					superadmin: true,
				});
				saSetAccessToken(data.accessToken);
				if (data.admin) {
					saSetAdmin(data.admin);
				}
			} catch {
				saClearAuth();
			}
		}

		restoreSession().finally(() => setInitialized());
		restoreSuperAdminSession().finally(() => saSetInitialized());
	}, [
		setAccessToken,
		setUser,
		clearAuth,
		setInitialized,
		saSetAccessToken,
		saSetAdmin,
		saClearAuth,
		saSetInitialized,
	]);

	const ready = isInitialized && saIsInitialized;

	if (!ready) {
		return (
			<div className="flex min-h-dvh items-center justify-center bg-(--background)">
				<div className="flex flex-col items-center gap-4">
					<div className="h-1 w-48 bg-(--surface-container-high)">
						<div className="h-full w-1/2 bg-(--primary-container) animate-pulse" />
					</div>
					<span className="mono-label text-[11px] uppercase tracking-[0.15em] text-(--dim)">
						{"// RESTORING_SESSION"}
					</span>
				</div>
			</div>
		);
	}

	return <>{children}</>;
}
