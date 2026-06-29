import { endpoints, http } from "@/lib/api/client";
import type {
	MarkReadPayload,
	MarkReadResponse,
	NotificationListResponse,
	UnreadCountResponse,
} from "../types";

export async function fetchUserNotifications(
	cursor?: string,
	limit = 20,
	unreadOnly = false,
): Promise<NotificationListResponse> {
	const params = new URLSearchParams();
	params.set("limit", String(limit));
	if (cursor) params.set("cursor", cursor);
	if (unreadOnly) params.set("unreadOnly", "true");
	return http.get<NotificationListResponse>(
		`${endpoints.notification.user.list}?${params}`,
		true,
	);
}

export async function fetchUnreadCount(): Promise<UnreadCountResponse> {
	return http.get<UnreadCountResponse>(
		endpoints.notification.user.unread,
		true,
	);
}

export async function markNotificationsRead(
	payload?: MarkReadPayload,
): Promise<MarkReadResponse> {
	return http.patch<MarkReadResponse>(
		endpoints.notification.user.markRead,
		payload ?? {},
		true,
	);
}

export async function deleteNotification(
	id: string,
): Promise<MarkReadResponse> {
	return http.delete<MarkReadResponse>(
		endpoints.notification.user.delete(id),
		true,
	);
}
