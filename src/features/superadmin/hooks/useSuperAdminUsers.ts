import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { banCandidate, fetchSuperAdminCandidates } from "../api";
import type { SuperAdminUserFilters } from "../types";

export function useSuperAdminCandidates(filters?: SuperAdminUserFilters) {
	return useQuery({
		queryKey: queryKeys.superadmin.candidates.list(
			filters as Record<string, unknown>,
		),
		queryFn: () => fetchSuperAdminCandidates(filters),
		staleTime: 30_000,
	});
}

export function useBanCandidate() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (candidateId: string) => banCandidate(candidateId),
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: queryKeys.superadmin.candidates.all(),
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.stats() });
		},
	});
}
