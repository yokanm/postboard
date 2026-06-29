// ─── SuperAdmin Auth Store ─────────────────────────────────
// Access token in memory ONLY. No persistence.

import { create } from "zustand";
import type { SuperAdminUser } from "#/shared/types/api";

interface SuperAdminAuthState {
	accessToken: string | null;
	admin: SuperAdminUser | null;
	isAuthenticated: boolean;
	isInitialized: boolean;
	isRestoringSession: boolean;

	setAccessToken: (token: string) => void;
	setAdmin: (admin: SuperAdminUser) => void;
	clearAuth: () => void;
	setInitialized: () => void;
	setRestoringSession: (restoring: boolean) => void;
}

export const useSuperAdminAuthStore = create<SuperAdminAuthState>((set) => ({
	accessToken: null,
	admin: null,
	isAuthenticated: false,
	isInitialized: false,
	isRestoringSession: false,

	setAccessToken: (accessToken) =>
		set({ accessToken, isAuthenticated: true, isInitialized: true }),

	setAdmin: (admin) =>
		set({
			admin,
			isAuthenticated: true,
			isInitialized: true,
			isRestoringSession: false,
		}),

	clearAuth: () =>
		set({
			accessToken: null,
			admin: null,
			isAuthenticated: false,
			isInitialized: true,
			isRestoringSession: false,
		}),

	setInitialized: () => set({ isInitialized: true, isRestoringSession: false }),

	setRestoringSession: (restoring) => set({ isRestoringSession: restoring }),
}));
