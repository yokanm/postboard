import { http, mapPaginated } from "@/lib/api/client";
import { env } from "@/lib/env";

const BASE_URL = env.apiUrl;

export interface SecurityEvent {
	id: string;
	companyId: string | null;
	actorId: string | null;
	eventType: string;
	severity: string;
	metadata: Record<string, unknown> | null;
	ipAddress: string | null;
	userAgent: string | null;
	createdAt: string;
}

export interface SecurityEventsResponse {
	events: SecurityEvent[];
	nextCursor: string | null;
	hasNextPage: boolean;
}

export interface SecurityEventsFilters {
	cursor?: string;
	limit?: number;
	eventType?: string;
	severity?: string;
}

export async function fetchSecurityEvents(
	filters?: SecurityEventsFilters,
): Promise<SecurityEventsResponse> {
	const params = new URLSearchParams();
	if (filters?.cursor) params.set("cursor", filters.cursor);
	if (filters?.limit) params.set("limit", String(filters.limit));
	if (filters?.eventType) params.set("eventType", filters.eventType);
	if (filters?.severity) params.set("severity", filters.severity);
	const qs = params.toString();
	const url = qs
		? `${BASE_URL}/superadmin/security-events?${qs}`
		: `${BASE_URL}/superadmin/security-events`;
	const response = await http.superadmin.get<{
		data: SecurityEvent[];
		nextCursor: string | null;
		hasNextPage: boolean;
	}>(url);
	return mapPaginated<SecurityEventsResponse>(response, "events");
}
