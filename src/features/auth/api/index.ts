import { endpoints, http } from "@/lib/api/client";
import type {
	CurrentUserResponse,
	ForgotPasswordCredentials,
	LoginCredentials,
	LoginResponse,
	RefreshResponse,
	RegisterCredentials,
	RegisterResponse,
	SendVerificationEmailCredentials,
} from "../types";

export async function loginUser(
	credentials: LoginCredentials,
): Promise<LoginResponse> {
	return http.post<LoginResponse>(endpoints.auth.login, credentials);
}

export async function registerUser(
	credentials: RegisterCredentials,
): Promise<RegisterResponse> {
	return http.post<RegisterResponse>(endpoints.auth.register, credentials);
}

export async function fetchCurrentUser(): Promise<CurrentUserResponse> {
	const data = await http.get<{ user: CurrentUserResponse }>(
		endpoints.user.current,
		true,
	);
	if (!data) {
		throw new Error("Unable to verify session");
	}
	return data.user;
}

export async function refreshAccessToken(): Promise<RefreshResponse> {
	return http.post<RefreshResponse>(endpoints.auth.refresh, {});
}

export async function logoutUser(): Promise<void> {
	await http.post<void>(endpoints.auth.logout, {}, true);
}

export async function requestPasswordReset(
	data: ForgotPasswordCredentials,
): Promise<{ message: string }> {
	return http.post<{ message: string }>(endpoints.auth.forgotPassword, data);
}

export async function resetPassword(
	token: string,
	password: string,
): Promise<{ message: string }> {
	const url = `${endpoints.auth.resetPassword}?token=${encodeURIComponent(token)}`;
	return http.post<{ message: string }>(url, { password });
}

export async function requestVerificationEmail(
	data: SendVerificationEmailCredentials,
): Promise<{ message: string }> {
	return http.post<{ message: string }>(
		endpoints.auth.sendVerificationEmail,
		data,
	);
}

export async function verifyEmail(token: string): Promise<{ message: string }> {
	const url = `${endpoints.auth.verifyEmail}?token=${encodeURIComponent(token)}`;
	return http.get<{ message: string }>(url);
}

export async function changePassword(
	currentPassword: string,
	newPassword: string,
): Promise<{ message: string }> {
	return http.post<{ message: string }>(
		endpoints.auth.changePassword,
		{ currentPassword, newPassword },
		true,
	);
}
