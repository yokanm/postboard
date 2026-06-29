import { endpoints, http, mapPaginated } from "@/lib/api/client";
import type {
	ApplicationListItem,
	ApplicationStatusUpdated,
	ApplicationSubmitted,
	ApplicationsListResponse,
	ListApplicationsParams,
	MyApplicationItem,
	MyApplicationsResponse,
	UpdateApplicationStatusInput,
} from "../types";

export async function getMyApplications(
	params?: ListApplicationsParams,
): Promise<MyApplicationsResponse> {
	const searchParams = new URLSearchParams();
	if (params) {
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined && value !== "") {
				searchParams.set(key, String(value));
			}
		}
	}
	const qs = searchParams.toString();
	const url = qs
		? `${endpoints.job.myApplications}?${qs}`
		: endpoints.job.myApplications;
	const response = await http.get<{
		data: MyApplicationItem[];
		nextCursor: string | null;
		hasNextPage: boolean;
	}>(url, true);
	return mapPaginated<MyApplicationsResponse>(response, "applications");
}

export async function getJobApplications(
	jobId: string,
	params?: ListApplicationsParams,
): Promise<ApplicationsListResponse> {
	const searchParams = new URLSearchParams();
	if (params) {
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined && value !== "") {
				searchParams.set(key, String(value));
			}
		}
	}
	const qs = searchParams.toString();
	const url = qs
		? `${endpoints.job.applications(jobId)}?${qs}`
		: endpoints.job.applications(jobId);
	const response = await http.get<{
		data: ApplicationListItem[];
		nextCursor: string | null;
		hasNextPage: boolean;
	}>(url, true);
	return mapPaginated<ApplicationsListResponse>(response, "applications");
}

export async function applyToJob(
	jobId: string,
	input: { coverLetter?: string; resumeUrl?: string },
): Promise<ApplicationSubmitted> {
	const data = await http.post<{ application: ApplicationSubmitted }>(
		endpoints.job.apply(jobId),
		input,
		true,
	);
	return data.application;
}

export async function updateApplicationStatus(
	applicationId: string,
	input: UpdateApplicationStatusInput,
): Promise<ApplicationStatusUpdated> {
	const data = await http.patch<{ application: ApplicationStatusUpdated }>(
		endpoints.job.applicationStatus(applicationId),
		input,
		true,
	);
	return data.application;
}

export async function withdrawApplication(
	applicationId: string,
): Promise<{ message: string }> {
	return http.delete<{ message: string }>(
		endpoints.job.withdrawApplication(applicationId),
		true,
	);
}
