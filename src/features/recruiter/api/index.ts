import { endpoints, http } from "@/lib/api/client";
import type { RecruiterAnalytics, RecruiterNotification } from "../types";

export async function fetchRecruiterAnalytics(
	recruiterId: string,
): Promise<RecruiterAnalytics> {
	return http.get<RecruiterAnalytics>(
		endpoints.company.recruiterAnalytics(recruiterId),
		true,
	);
}

export async function fetchRecruiterNotifications(params?: {
	cursor?: string;
	limit?: string;
	unreadOnly?: string;
}): Promise<{
	notifications: RecruiterNotification[];
	nextCursor: string | null;
	hasNextPage: boolean;
}> {
	const searchParams = new URLSearchParams();
	if (params?.cursor) searchParams.set("cursor", params.cursor);
	if (params?.limit) searchParams.set("limit", params.limit);
	if (params?.unreadOnly) searchParams.set("unreadOnly", params.unreadOnly);
	const qs = searchParams.toString();
	const url = qs
		? `${endpoints.notification.company.list}?${qs}`
		: endpoints.notification.company.list;
	const response = await http.get<{
		data: RecruiterNotification[];
		nextCursor: string | null;
		hasNextPage: boolean;
	}>(url, true);
	return {
		notifications: response.data,
		nextCursor: response.nextCursor,
		hasNextPage: response.hasNextPage,
	};
}

export async function markNotificationRead(
	notificationId: string,
): Promise<{ message: string }> {
	return http.patch<{ message: string }>(
		endpoints.notification.company.markSingleRead(notificationId),
		{},
		true,
	);
}

export async function markAllNotificationsRead(): Promise<{ message: string }> {
	return http.post<{ message: string }>(
		endpoints.notification.company.markRead,
		{},
		true,
	);
}
