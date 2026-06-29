import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import {
	fetchSuperAdminCompanies,
	superAdminDeleteCompany,
	superAdminVerifyCompany,
} from "../api";
import type { SuperAdminCompanyFilters } from "../types";

export function useSuperAdminCompanies(filters?: SuperAdminCompanyFilters) {
	return useQuery({
		queryKey: queryKeys.superadmin.companies.list(
			filters as Record<string, unknown>,
		),
		queryFn: () => fetchSuperAdminCompanies(filters),
		staleTime: 30_000,
	});
}

export function useSuperAdminVerifyCompany() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			companyId,
			isVerified,
		}: {
			companyId: string;
			isVerified: boolean;
		}) => superAdminVerifyCompany(companyId, isVerified),
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: queryKeys.superadmin.companies.all(),
			});
		},
	});
}

export function useSuperAdminDeleteCompany() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (companyId: string) => superAdminDeleteCompany(companyId),
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: queryKeys.superadmin.companies.all(),
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.stats() });
		},
	});
}
