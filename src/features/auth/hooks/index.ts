import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { getDefaultDashboardByRole } from "@/guards";
import { queryKeys } from "@/lib/api/query-keys";
import { useAuthStore } from "@/stores";
import {
	changePassword,
	fetchCurrentUser,
	loginUser,
	logoutUser,
	registerUser,
	requestPasswordReset,
	requestVerificationEmail,
	resetPassword,
	verifyEmail,
} from "../api";
import type {
	ForgotPasswordCredentials,
	LoginCredentials,
	RegisterCredentials,
} from "../types";

export function useCurrentUser() {
	const setUser = useAuthStore((s) => s.setUser);
	const accessToken = useAuthStore((s) => s.accessToken);

	return useQuery({
		queryKey: queryKeys.auth.user(),
		queryFn: async () => {
			const user = await fetchCurrentUser();
			setUser(user);
			return user;
		},
		enabled: !!accessToken,
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 10,
		retry: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
	});
}

export function useLogin() {
	const router = useRouter();
	const setAccessToken = useAuthStore((s) => s.setAccessToken);

	return useMutation({
		mutationFn: (credentials: LoginCredentials) => loginUser(credentials),
		onSuccess: (data) => {
			setAccessToken(data.accessToken);
			toast.success("Signed in successfully");
			router.navigate({ to: getDefaultDashboardByRole(data.user.role) });
		},
		onError: (error) => {
			toast.error(error instanceof Error ? error.message : "Login failed");
		},
	});
}

export function useRegister() {
	const router = useRouter();

	return useMutation({
		mutationFn: (credentials: RegisterCredentials) => registerUser(credentials),
		onSuccess: (data) => {
			toast.success(
				data.message ||
					"Account created. Please verify your email before logging in.",
			);
			router.navigate({
				to: "/verify-email",
				search: { token: "", email: data.user.email },
			});
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Registration failed",
			);
		},
	});
}

export function useLogout() {
	const router = useRouter();
	const clearAuth = useAuthStore((s) => s.clearAuth);
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => logoutUser(),
		onSuccess() {
			toast.success("Signed out");
		},
		onSettled() {
			clearAuth();
			queryClient.clear();
			router.navigate({ to: "/login" });
		},
	});
}

export function useForgotPassword() {
	return useMutation({
		mutationFn: (data: ForgotPasswordCredentials) => requestPasswordReset(data),
		onSuccess: () => {
			toast.success("Password reset email sent");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Failed to send reset email",
			);
		},
	});
}

export function useResetPassword() {
	return useMutation({
		mutationFn: ({ token, password }: { token: string; password: string }) =>
			resetPassword(token, password),
		onSuccess: () => {
			toast.success("Password reset successfully");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Failed to reset password",
			);
		},
	});
}

export function useVerifyEmail() {
	return useMutation({
		mutationFn: (token: string) => verifyEmail(token),
		onSuccess: () => {
			toast.success("Email verified successfully");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Failed to verify email",
			);
		},
	});
}

export function useResendVerificationEmail() {
	return useMutation({
		mutationFn: (email: string) => requestVerificationEmail({ email }),
		onSuccess: () => {
			toast.success("Verification email sent");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to send verification email",
			);
		},
	});
}

export function useChangePassword() {
	return useMutation({
		mutationFn: ({
			currentPassword,
			newPassword,
		}: {
			currentPassword: string;
			newPassword: string;
		}) => changePassword(currentPassword, newPassword),
		onSuccess: () => {
			toast.success("Password changed successfully");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Failed to change password",
			);
		},
	});
}
