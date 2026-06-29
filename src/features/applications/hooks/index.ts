import {
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import {
	applyToJob,
	getJobApplications,
	getMyApplications,
	updateApplicationStatus,
	withdrawApplication,
} from "../api";
import type {
	ListApplicationsParams,
	UpdateApplicationStatusInput,
} from "../types";

export function useMyApplications(params?: ListApplicationsParams) {
	return useInfiniteQuery({
		queryKey: queryKeys.job.myApplications(),
		queryFn: ({ pageParam }) =>
			getMyApplications({
				...params,
				cursor: pageParam as string | undefined,
			}),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) =>
			lastPage.hasNextPage ? lastPage.nextCursor : undefined,
		select: (data) => ({
			pages: data.pages,
			pageParams: data.pageParams,
			applications: data.pages.flatMap((p) => p.applications),
		}),
	});
}

export function useJobApplications(
	jobId: string,
	params?: ListApplicationsParams,
) {
	return useInfiniteQuery({
		queryKey: queryKeys.job.applications(jobId),
		queryFn: ({ pageParam }) =>
			getJobApplications(jobId, {
				...params,
				cursor: pageParam as string | undefined,
			}),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) =>
			lastPage.hasNextPage ? lastPage.nextCursor : undefined,
		enabled: !!jobId,
		select: (data) => ({
			pages: data.pages,
			pageParams: data.pageParams,
			applications: data.pages.flatMap((p) => p.applications),
		}),
	});
}

export function useApplyToJob() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			jobId,
			input,
		}: {
			jobId: string;
			input: { coverLetter?: string; resumeUrl?: string };
		}) => applyToJob(jobId, input),
		onSuccess(_, { jobId }) {
			queryClient.invalidateQueries({
				queryKey: queryKeys.job.myApplications(),
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.job.detail(jobId) });
		},
	});
}

export function useUpdateApplicationStatus() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			applicationId,
			input,
		}: {
			applicationId: string;
			input: UpdateApplicationStatusInput;
		}) => updateApplicationStatus(applicationId, input),
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: queryKeys.job.all });
		},
	});
}

export function useWithdrawApplication() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (applicationId: string) => withdrawApplication(applicationId),
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: queryKeys.job.myApplications(),
			});
		},
	});
}
