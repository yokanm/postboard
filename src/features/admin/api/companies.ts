import { endpoints, http, mapPaginated } from "@/lib/api/client";
import type {
	AdminCompany,
	AdminCompanyFilters,
	AdminCompanyListResponse,
} from "../types";

export async function fetchAdminCompanies(
	filters?: AdminCompanyFilters,
): Promise<AdminCompanyListResponse> {
	const params = new URLSearchParams();
	if (filters?.cursor) params.set("cursor", filters.cursor);
	if (filters?.limit) params.set("limit", String(filters.limit));
	if (filters?.search) params.set("search", filters.search);
	if (filters?.verified !== undefined)
		params.set("verified", String(filters.verified));
	const qs = params.toString();
	const url = qs
		? `${endpoints.admin.companies}?${qs}`
		: endpoints.admin.companies;
	const response = await http.get<{
		data: AdminCompany[];
		nextCursor: string | null;
		hasNextPage: boolean;
	}>(url, true);
	return mapPaginated<AdminCompanyListResponse>(response, "companies");
}

export async function verifyCompany(
	companyId: string,
	isVerified: boolean,
): Promise<void> {
	await http.patch<{ message: string }>(
		endpoints.admin.verifyCompany(companyId),
		{ isVerified },
		true,
	);
}
