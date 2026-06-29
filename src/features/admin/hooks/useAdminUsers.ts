import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { deactivateUser, fetchAdminUsers } from "../api";
import type { AdminUserFilters } from "../types";

export function useAdminUsers(filters?: AdminUserFilters) {
	return useQuery({
		queryKey: queryKeys.admin.users.list(filters as Record<string, unknown>),
		queryFn: () => fetchAdminUsers(filters),
		staleTime: 30_000,
	});
}

export function useDeactivateUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (userId: string) => deactivateUser(userId),
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all() });
			queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
		},
	});
}
