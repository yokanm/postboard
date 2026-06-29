import { http, mapPaginated } from "@/lib/api/client";
import { env } from "@/lib/env";
import type {
	SuperAdminCandidate,
	SuperAdminUserFilters,
	SuperAdminUserListResponse,
} from "../types";

const BASE_URL = env.apiUrl;

export async function fetchSuperAdminCandidates(
	filters?: SuperAdminUserFilters,
): Promise<SuperAdminUserListResponse> {
	const params = new URLSearchParams();
	if (filters?.cursor) params.set("cursor", filters.cursor);
	if (filters?.limit) params.set("limit", String(filters.limit));
	if (filters?.search) params.set("search", filters.search);
	const qs = params.toString();
	const url = qs
		? `${BASE_URL}/superadmin/candidates?${qs}`
		: `${BASE_URL}/superadmin/candidates`;
	const response = await http.superadmin.get<{
		data: SuperAdminCandidate[];
		nextCursor: string | null;
		hasNextPage: boolean;
	}>(url);
	return mapPaginated<SuperAdminUserListResponse>(response, "candidates");
}

export async function banCandidate(candidateId: string): Promise<void> {
	await http.superadmin.delete(
		`${BASE_URL}/superadmin/candidates/${candidateId}/ban`,
	);
}
