import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { fetchSuperAdminJobs, superAdminForceCloseJob } from "../api";
import type { SuperAdminJobFilters } from "../types";

export function useSuperAdminJobs(filters?: SuperAdminJobFilters) {
	return useQuery({
		queryKey: queryKeys.superadmin.jobs.list(
			filters as Record<string, unknown>,
		),
		queryFn: () => fetchSuperAdminJobs(filters),
		staleTime: 30_000,
	});
}

export function useSuperAdminForceCloseJob() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (jobId: string) => superAdminForceCloseJob(jobId),
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: queryKeys.superadmin.jobs.all(),
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.stats() });
		},
	});
}
