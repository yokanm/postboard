import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { fetchAuditLogs } from "../api";
import type { AuditLogFilters, AuditLogListResponse } from "../types";

export function useAdminAuditLogs(filters?: AuditLogFilters) {
	return useQuery<AuditLogListResponse>({
		queryKey: queryKeys.admin.auditLogs.list(
			filters as Record<string, unknown>,
		),
		queryFn: () => fetchAuditLogs(filters),
		staleTime: 30_000,
	});
}
