import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/api/query-keys";
import {
	fetchRecruiterAnalytics,
	fetchRecruiterNotifications,
	markAllNotificationsRead,
	markNotificationRead,
} from "../api";

export function useRecruiterAnalytics(recruiterId: string) {
	return useQuery({
		queryKey: queryKeys.company.recruiterAnalytics(recruiterId),
		queryFn: () => fetchRecruiterAnalytics(recruiterId),
		enabled: !!recruiterId,
	});
}

export function useRecruiterNotifications(params?: {
	cursor?: string;
	limit?: string;
	unreadOnly?: string;
}) {
	return useQuery({
		queryKey: [
			...queryKeys.notification.company.list(params as Record<string, unknown>),
		],
		queryFn: () => fetchRecruiterNotifications(params),
	});
}

export function useMarkNotificationRead() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (notificationId: string) =>
			markNotificationRead(notificationId),
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: [...queryKeys.notification.all, "company"],
			});
		},
	});
}

export function useMarkAllNotificationsRead() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => markAllNotificationsRead(),
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: [...queryKeys.notification.all, "company"],
			});
			toast.success("All notifications marked as read");
		},
	});
}
