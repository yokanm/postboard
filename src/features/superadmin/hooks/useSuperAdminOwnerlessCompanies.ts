import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import type { OwnerlessCompanyFilters } from "../api";
import { assignOwner, fetchOwnerlessCompanies, recoverOwnership } from "../api";

export function useSuperAdminOwnerlessCompanies(
	filters?: OwnerlessCompanyFilters,
) {
	return useQuery({
		queryKey: queryKeys.superadmin.ownerlessCompanies.list(
			filters as Record<string, unknown>,
		),
		queryFn: () => fetchOwnerlessCompanies(filters),
		staleTime: 30_000,
	});
}

export function useSuperAdminAssignOwner() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			companyId,
			newOwnerId,
		}: {
			companyId: string;
			newOwnerId: string;
		}) => assignOwner(companyId, newOwnerId),
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: queryKeys.superadmin.ownerlessCompanies.all(),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.superadmin.companies.all(),
			});
		},
	});
}

export function useSuperAdminRecoverOwnership() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (companyId: string) => recoverOwnership(companyId),
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: queryKeys.superadmin.ownerlessCompanies.all(),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.superadmin.companies.all(),
			});
		},
	});
}
