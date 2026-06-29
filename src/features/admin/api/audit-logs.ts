import { endpoints, http, mapPaginated } from "@/lib/api/client";
import type { AuditLog, AuditLogFilters, AuditLogListResponse } from "../types";

export async function fetchAuditLogs(
	filters?: AuditLogFilters,
): Promise<AuditLogListResponse> {
	const params = new URLSearchParams();
	if (filters?.cursor) params.set("cursor", filters.cursor);
	if (filters?.limit) params.set("limit", String(filters.limit));
	if (filters?.action) params.set("action", filters.action);
	if (filters?.actorId) params.set("actorId", filters.actorId);
	const qs = params.toString();
	const url = qs
		? `${endpoints.admin.auditLogs}?${qs}`
		: endpoints.admin.auditLogs;
	const response = await http.get<{
		data: AuditLog[];
		nextCursor: string | null;
		hasNextPage: boolean;
	}>(url, true);
	return mapPaginated<AuditLogListResponse>(response, "logs");
}
