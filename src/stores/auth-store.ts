// ─── Auth Store ────────────────────────────────────────────
// Access token stored in memory ONLY.
// No localStorage. No sessionStorage.

import { create } from "zustand";
import type { CurrentUser, UserRole } from "#/shared/types/api";

interface AuthState {
	accessToken: string | null;
	user: CurrentUser | null;
	role: UserRole | null;
	isAuthenticated: boolean;
	isInitialized: boolean;
	isRestoringSession: boolean;

	setAccessToken: (token: string) => void;
	setUser: (user: CurrentUser) => void;
	clearAuth: () => void;
	setInitialized: () => void;
	setRestoringSession: (restoring: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
	accessToken: null,
	user: null,
	role: null,
	isAuthenticated: false,
	isInitialized: false,
	isRestoringSession: false,

	setAccessToken: (accessToken) =>
		set({ accessToken, isAuthenticated: !!accessToken, isInitialized: true }),

	setUser: (user) =>
		set({
			user,
			role: user.role,
			isAuthenticated: true,
			isInitialized: true,
			isRestoringSession: false,
		}),

	clearAuth: () =>
		set({
			accessToken: null,
			user: null,
			role: null,
			isAuthenticated: false,
			isInitialized: true,
			isRestoringSession: false,
		}),

	setInitialized: () => set({ isInitialized: true, isRestoringSession: false }),

	setRestoringSession: (restoring) => set({ isRestoringSession: restoring }),
}));
