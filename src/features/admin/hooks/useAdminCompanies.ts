import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { fetchAdminCompanies, verifyCompany } from "../api";
import type { AdminCompanyFilters } from "../types";

export function useAdminCompanies(filters?: AdminCompanyFilters) {
	return useQuery({
		queryKey: queryKeys.admin.companies.list(
			filters as Record<string, unknown>,
		),
		queryFn: () => fetchAdminCompanies(filters),
		staleTime: 30_000,
	});
}

export function useVerifyCompany() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			companyId,
			isVerified,
		}: {
			companyId: string;
			isVerified: boolean;
		}) => verifyCompany(companyId, isVerified),
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: queryKeys.admin.companies.all(),
			});
		},
	});
}
