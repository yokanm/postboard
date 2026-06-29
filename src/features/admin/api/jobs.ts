import { endpoints, http, mapPaginated } from "@/lib/api/client";
import type { AdminJob, AdminJobFilters, AdminJobListResponse } from "../types";

export async function fetchAdminJobs(
	filters?: AdminJobFilters,
): Promise<AdminJobListResponse> {
	const params = new URLSearchParams();
	if (filters?.cursor) params.set("cursor", filters.cursor);
	if (filters?.limit) params.set("limit", String(filters.limit));
	if (filters?.status) params.set("status", filters.status);
	if (filters?.search) params.set("search", filters.search);
	const qs = params.toString();
	const url = qs ? `${endpoints.admin.jobs}?${qs}` : endpoints.admin.jobs;
	const response = await http.get<{
		data: AdminJob[];
		nextCursor: string | null;
		hasNextPage: boolean;
	}>(url, true);
	return mapPaginated<AdminJobListResponse>(response, "jobs");
}

export async function forceCloseJob(
	jobId: string,
	reason?: string,
): Promise<void> {
	await http.patch<{ message: string }>(
		endpoints.admin.forceCloseJob(jobId),
		reason ? { reason } : {},
		true,
	);
}

export async function adminDeleteJob(jobId: string): Promise<void> {
	await http.delete<{ message: string }>(
		endpoints.admin.deleteJob(jobId),
		true,
	);
}
