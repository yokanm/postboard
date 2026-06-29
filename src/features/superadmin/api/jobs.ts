import { http, mapPaginated } from "@/lib/api/client";
import { env } from "@/lib/env";
import type {
	SuperAdminJob,
	SuperAdminJobFilters,
	SuperAdminJobListResponse,
} from "../types";

const BASE_URL = env.apiUrl;

export async function fetchSuperAdminJobs(
	filters?: SuperAdminJobFilters,
): Promise<SuperAdminJobListResponse> {
	const params = new URLSearchParams();
	if (filters?.cursor) params.set("cursor", filters.cursor);
	if (filters?.limit) params.set("limit", String(filters.limit));
	if (filters?.search) params.set("search", filters.search);
	if (filters?.status) params.set("status", filters.status);
	if (filters?.companyId) params.set("companyId", filters.companyId);
	const qs = params.toString();
	const url = qs
		? `${BASE_URL}/superadmin/jobs?${qs}`
		: `${BASE_URL}/superadmin/jobs`;
	const response = await http.superadmin.get<{
		data: SuperAdminJob[];
		nextCursor: string | null;
		hasNextPage: boolean;
	}>(url);
	return mapPaginated<SuperAdminJobListResponse>(response, "jobs");
}

export async function superAdminForceCloseJob(jobId: string): Promise<void> {
	await http.superadmin.delete(
		`${BASE_URL}/superadmin/jobs/${jobId}/force-close`,
	);
}
