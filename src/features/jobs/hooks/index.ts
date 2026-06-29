import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import {
	createJob,
	deleteJob,
	getJob,
	listJobs,
	listTags,
	updateJob,
	updateJobStatus,
} from "../api";
import type {
	CreateJobInput,
	ListJobsParams,
	ListTagsParams,
	UpdateJobInput,
	UpdateJobStatusInput,
} from "../types";

// ─── Job Queries ────────────────────────────────────────────

export function useJobs(params?: ListJobsParams) {
	return useInfiniteQuery({
		queryKey: queryKeys.job.list(params as Record<string, unknown>),
		queryFn: ({ pageParam }) =>
			listJobs({ ...params, cursor: pageParam as string | undefined }),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) =>
			lastPage.hasNextPage ? lastPage.nextCursor : undefined,
		select: (data) => ({
			pages: data.pages,
			pageParams: data.pageParams,
			jobs: data.pages.flatMap((p) => p.jobs),
		}),
	});
}

export function useJob(id: string) {
	return useQuery({
		queryKey: queryKeys.job.detail(id),
		queryFn: () => getJob(id),
		enabled: !!id,
	});
}

// ─── Job Mutations ──────────────────────────────────────────

export function useCreateJob() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateJobInput) => createJob(input),
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: queryKeys.job.all });
		},
	});
}

export function useUpdateJob() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, input }: { id: string; input: UpdateJobInput }) =>
			updateJob(id, input),
		onSuccess(data) {
			queryClient.invalidateQueries({
				queryKey: queryKeys.job.detail(data.id),
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.job.all });
		},
	});
}

export function useUpdateJobStatus() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, input }: { id: string; input: UpdateJobStatusInput }) =>
			updateJobStatus(id, input),
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: queryKeys.job.all });
		},
	});
}

export function useDeleteJob() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteJob(id),
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: queryKeys.job.all });
		},
	});
}

// ─── Tag Queries ────────────────────────────────────────────

export function useTags(params?: ListTagsParams) {
	return useQuery({
		queryKey: queryKeys.tag.list(params as Record<string, unknown>),
		queryFn: () => listTags(params),
		staleTime: 1000 * 60 * 10,
	});
}

export function useCompanyJobs(companyId: string, excludeJobId: string) {
	return useQuery({
		queryKey: [...queryKeys.job.all, "company", companyId],
		queryFn: () => listJobs({ companyId, limit: "5" }),
		enabled: !!companyId,
		select: (data) => data.jobs.filter((j) => j.id !== excludeJobId),
		staleTime: 1000 * 60 * 5,
	});
}
