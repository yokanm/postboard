import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import type { SecurityEventsFilters } from "../api";
import { fetchSecurityEvents } from "../api";

export function useSuperAdminSecurityEvents(filters?: SecurityEventsFilters) {
	return useQuery({
		queryKey: queryKeys.superadmin.securityEvents.list(
			filters as Record<string, unknown>,
		),
		queryFn: () => fetchSecurityEvents(filters),
		staleTime: 30_000,
	});
}
