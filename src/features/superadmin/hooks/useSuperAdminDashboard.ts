import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { fetchSuperAdminStats } from "../api";

export function useSuperAdminStats() {
	return useQuery({
		queryKey: queryKeys.superadmin.stats(),
		queryFn: fetchSuperAdminStats,
		staleTime: 60_000,
	});
}
