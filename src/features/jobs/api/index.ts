import { endpoints, http, mapPaginated } from "@/lib/api/client";
import type {
	CreateJobInput,
	JobDetail,
	JobSummary,
	JobsListResponse,
	ListJobsParams,
	ListTagsParams,
	TagsListResponse,
	UpdateJobInput,
	UpdateJobStatusInput,
} from "../types";

// ─── Jobs ───────────────────────────────────────────────────

export async function listJobs(
	params?: ListJobsParams,
): Promise<JobsListResponse> {
	const searchParams = new URLSearchParams();
	if (params) {
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined && value !== "") {
				if (key === "search") {
					searchParams.set("keyword", String(value));
				} else {
					searchParams.set(key, String(value));
				}
			}
		}
	}
	const qs = searchParams.toString();
	const url = qs ? `${endpoints.job.list}?${qs}` : endpoints.job.list;
	const response = await http.get<{
		data: JobSummary[];
		nextCursor: string | null;
		hasNextPage: boolean;
	}>(url);
	return mapPaginated<JobsListResponse>(response, "jobs");
}

export async function getJob(id: string): Promise<JobDetail> {
	const data = await http.get<{ job: JobDetail }>(endpoints.job.detail(id));
	return data.job;
}

export async function createJob(input: CreateJobInput): Promise<JobSummary> {
	const data = await http.post<{ job: JobSummary }>(
		endpoints.job.create,
		input,
		true,
	);
	return data.job;
}

export async function updateJob(
	id: string,
	input: UpdateJobInput,
): Promise<JobSummary> {
	const data = await http.patch<{ job: JobSummary }>(
		endpoints.job.update(id),
		input,
		true,
	);
	return data.job;
}

export async function updateJobStatus(
	id: string,
	input: UpdateJobStatusInput,
): Promise<{ id: string; status: string; updatedAt: string }> {
	const data = await http.patch<{
		job: { id: string; status: string; updatedAt: string };
	}>(endpoints.job.updateStatus(id), input, true);
	return data.job;
}

export async function deleteJob(id: string): Promise<{ message: string }> {
	return http.delete<{ message: string }>(endpoints.job.delete(id), true);
}

// ─── Tags ───────────────────────────────────────────────────

export async function listTags(
	params?: ListTagsParams,
): Promise<TagsListResponse> {
	const searchParams = new URLSearchParams();
	if (params) {
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined && value !== "") {
				searchParams.set(key, String(value));
			}
		}
	}
	const qs = searchParams.toString();
	const url = qs ? `${endpoints.tags.list}?${qs}` : endpoints.tags.list;
	return http.get<TagsListResponse>(url);
}
