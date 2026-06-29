import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { adminDeleteJob, fetchAdminJobs, forceCloseJob } from "../api";
import type { AdminJobFilters } from "../types";

export function useAdminJobs(filters?: AdminJobFilters) {
	return useQuery({
		queryKey: queryKeys.admin.jobs.list(filters as Record<string, unknown>),
		queryFn: () => fetchAdminJobs(filters),
		staleTime: 30_000,
	});
}

export function useForceCloseJob() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ jobId, reason }: { jobId: string; reason?: string }) =>
			forceCloseJob(jobId, reason),
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: queryKeys.admin.jobs.all() });
		},
	});
}

export function useAdminDeleteJob() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (jobId: string) => adminDeleteJob(jobId),
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: queryKeys.admin.jobs.all() });
		},
	});
}
