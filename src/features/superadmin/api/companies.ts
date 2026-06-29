import { http, mapPaginated } from "@/lib/api/client";
import { env } from "@/lib/env";
import type {
	SuperAdminCompanyFilters,
	SuperAdminCompanyListItem,
	SuperAdminCompanyListResponse,
} from "../types";

const BASE_URL = env.apiUrl;

export async function fetchSuperAdminCompanies(
	filters?: SuperAdminCompanyFilters,
): Promise<SuperAdminCompanyListResponse> {
	const params = new URLSearchParams();
	if (filters?.cursor) params.set("cursor", filters.cursor);
	if (filters?.limit) params.set("limit", String(filters.limit));
	if (filters?.search) params.set("search", filters.search);
	if (filters?.isVerified !== undefined)
		params.set("isVerified", String(filters.isVerified));
	const qs = params.toString();
	const url = qs
		? `${BASE_URL}/superadmin/companies?${qs}`
		: `${BASE_URL}/superadmin/companies`;
	const response = await http.superadmin.get<{
		data: SuperAdminCompanyListItem[];
		nextCursor: string | null;
		hasNextPage: boolean;
	}>(url);
	return mapPaginated<SuperAdminCompanyListResponse>(response, "companies");
}

export async function superAdminVerifyCompany(
	companyId: string,
	isVerified: boolean,
): Promise<void> {
	await http.superadmin.patch(
		`${BASE_URL}/superadmin/companies/${companyId}/verify`,
		{ isVerified },
	);
}

export async function superAdminDeleteCompany(
	companyId: string,
): Promise<void> {
	await http.superadmin.delete(`${BASE_URL}/superadmin/companies/${companyId}`);
}
