import { endpoints, http, mapPaginated } from "@/lib/api/client";
import type {
	AdminUser,
	AdminUserFilters,
	AdminUserListResponse,
} from "../types";

export async function fetchAdminUsers(
	filters?: AdminUserFilters,
): Promise<AdminUserListResponse> {
	const params = new URLSearchParams();
	if (filters?.cursor) params.set("cursor", filters.cursor);
	if (filters?.limit) params.set("limit", String(filters.limit));
	if (filters?.role) params.set("role", filters.role);
	if (filters?.search) params.set("search", filters.search);
	const qs = params.toString();
	const url = qs ? `${endpoints.admin.users}?${qs}` : endpoints.admin.users;
	const response = await http.get<{
		data: AdminUser[];
		nextCursor: string | null;
		hasNextPage: boolean;
	}>(url, true);
	return mapPaginated<AdminUserListResponse>(response, "users");
}

export async function deactivateUser(userId: string): Promise<void> {
	await http.delete<{ message: string }>(
		endpoints.admin.deactivateUser(userId),
		true,
	);
}
