import { http } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

interface LoginResponse {
	message: string;
	accessToken: string;
	refreshToken: string;
	admin: {
		id: string;
		email: string;
		firstName: string;
		lastName: string;
	};
}

export async function superAdminLogin(
	email: string,
	password: string,
): Promise<LoginResponse> {
	return http.post<LoginResponse>(
		endpoints.superadmin.login,
		{ email, password },
		false,
	);
}

export async function superAdminRefresh(): Promise<{ accessToken: string }> {
	return http.post<{ accessToken: string }>(
		endpoints.superadmin.refresh,
		undefined,
		false,
	);
}

export async function superAdminLogout(): Promise<void> {
	await http.post<void>(endpoints.superadmin.logout, undefined, false);
}
