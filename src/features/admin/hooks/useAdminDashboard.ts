import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { fetchAdminStats } from "../api";
import type { PlatformStats } from "../types";

export function useAdminStats() {
	return useQuery<PlatformStats>({
		queryKey: queryKeys.admin.stats(),
		queryFn: fetchAdminStats,
		staleTime: 60_000,
	});
}
