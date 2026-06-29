import { http, mapPaginated } from "@/lib/api/client";
import { env } from "@/lib/env";
import type { SuperAdminCompanyListItem } from "../types";

const BASE_URL = env.apiUrl;

export interface OwnerlessCompanyListResponse {
	companies: SuperAdminCompanyListItem[];
	nextCursor: string | null;
	hasNextPage: boolean;
}

export interface OwnerlessCompanyFilters {
	cursor?: string;
	limit?: number;
}

export async function fetchOwnerlessCompanies(
	filters?: OwnerlessCompanyFilters,
): Promise<OwnerlessCompanyListResponse> {
	const params = new URLSearchParams();
	if (filters?.cursor) params.set("cursor", String(filters.cursor));
	if (filters?.limit) params.set("limit", String(filters.limit));
	const qs = params.toString();
	const url = qs
		? `${BASE_URL}/superadmin/ownerless-companies?${qs}`
		: `${BASE_URL}/superadmin/ownerless-companies`;
	const response = await http.superadmin.get<{
		data: SuperAdminCompanyListItem[];
		nextCursor: string | null;
		hasNextPage: boolean;
	}>(url);
	return mapPaginated<OwnerlessCompanyListResponse>(response, "companies");
}

export async function assignOwner(
	companyId: string,
	newOwnerId: string,
): Promise<void> {
	await http.superadmin.post(
		`${BASE_URL}/superadmin/companies/${companyId}/assign-owner`,
		{ newOwnerId },
	);
}

export async function recoverOwnership(companyId: string): Promise<void> {
	await http.superadmin.post(
		`${BASE_URL}/superadmin/companies/${companyId}/recover-ownership`,
	);
}
