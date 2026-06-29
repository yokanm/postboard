import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import {
	deleteResume,
	fetchProfile,
	updateProfile,
	uploadResume,
} from "../api";
import type { UpdateProfilePayload } from "../types";

export function useProfile() {
	return useQuery({
		queryKey: queryKeys.profile.detail(),
		queryFn: fetchProfile,
	});
}

export function useUpdateProfile() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: UpdateProfilePayload) => updateProfile(data),
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: queryKeys.profile.detail() });
			queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
		},
	});
}

export function useUploadResume() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (file: File) => uploadResume(file),
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: queryKeys.profile.detail() });
			queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
		},
	});
}

export function useDeleteResume() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => deleteResume(),
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: queryKeys.profile.detail() });
			queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
		},
	});
}
