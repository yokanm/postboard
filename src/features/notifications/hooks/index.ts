import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import {
	deleteNotification,
	fetchUnreadCount,
	fetchUserNotifications,
	markNotificationsRead,
} from "../api";

export function useNotifications() {
	return useInfiniteQuery({
		queryKey: queryKeys.notification.list(),
		queryFn: ({ pageParam }) =>
			fetchUserNotifications(pageParam as string | undefined),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
	});
}

export function useUnreadCount() {
	return useQuery({
		queryKey: queryKeys.notification.unread(),
		queryFn: fetchUnreadCount,
		refetchOnWindowFocus: true,
	});
}

export function useMarkNotificationsRead() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (ids?: string[]) =>
			markNotificationsRead(ids ? { ids } : undefined),
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: queryKeys.notification.all });
		},
	});
}

export function useDeleteNotification() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteNotification(id),
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: queryKeys.notification.all });
		},
	});
}
