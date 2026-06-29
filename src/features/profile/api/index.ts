import { endpoints, http } from "@/lib/api/client";
import type {
	ProfileResponse,
	ResumeUploadResponse,
	UpdateProfilePayload,
} from "../types";

export async function fetchProfile(): Promise<ProfileResponse> {
	return http.get<ProfileResponse>(endpoints.user.profile, true);
}

export async function updateProfile(
	data: UpdateProfilePayload,
): Promise<ProfileResponse> {
	return http.put<ProfileResponse>(endpoints.user.profile, data, true);
}

export async function uploadResume(file: File): Promise<ResumeUploadResponse> {
	const formData = new FormData();
	formData.append("resume", file);
	return http.upload<ResumeUploadResponse>(
		endpoints.user.uploadResume,
		formData,
		true,
	);
}

export async function deleteResume(): Promise<void> {
	return http.delete<void>(endpoints.user.deleteResume, true);
}
