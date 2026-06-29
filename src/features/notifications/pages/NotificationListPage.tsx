import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	useDeleteNotification,
	useMarkNotificationsRead,
	useNotifications,
} from "../hooks";
import type { NotificationItem } from "../types";
import { getNotificationNavigation } from "../utils/notificationNavigation";
import { getNotificationTypeConfig } from "../utils/notificationTypeMap";

type TimeGroup = "TODAY" | "YESTERDAY" | "EARLIER";

function getTimeGroup(iso: string): TimeGroup {
	const d = new Date(iso);
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);
	if (d >= today) return "TODAY";
	if (d >= yesterday) return "YESTERDAY";
	return "EARLIER";
}

function groupNotifications(
	items: NotificationItem[],
): Array<{ group: TimeGroup; items: NotificationItem[] }> {
	const groups: Record<TimeGroup, NotificationItem[]> = {
		TODAY: [],
		YESTERDAY: [],
		EARLIER: [],
	};
	for (const item of items) {
		groups[getTimeGroup(item.createdAt)].push(item);
	}
	return (
		[
			{ group: "TODAY" as TimeGroup, items: groups.TODAY },
			{ group: "YESTERDAY" as TimeGroup, items: groups.YESTERDAY },
			{ group: "EARLIER" as TimeGroup, items: groups.EARLIER },
		] as const
	).filter((g) => g.items.length > 0);
}

export function NotificationListPage() {
	const navigate = useNavigate();
	const {
		data,
		isLoading,
		isError,
		error,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useNotifications();
	const markRead = useMarkNotificationsRead();
	const deleteNotif = useDeleteNotification();
	const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
	const loadMoreRef = useRef<HTMLDivElement>(null);

	const allNotifications = data?.pages.flatMap((p) => p.notifications) ?? [];
	const unreadIds = allNotifications.filter((n) => !n.isRead).map((n) => n.id);
	const grouped = useMemo(
		() => groupNotifications(allNotifications),
		[allNotifications],
	);

	useEffect(() => {
		const el = loadMoreRef.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{ threshold: 0.1 },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	function handleMarkAllRead() {
		if (unreadIds.length > 0) markRead.mutate(unreadIds);
	}

	function handleMarkRead(id: string) {
		markRead.mutate([id]);
	}

	function handleDelete(id: string) {
		deleteNotif.mutate(id);
		setConfirmDelete(null);
	}

	function handleNotificationClick(notif: NotificationItem) {
		const route = getNotificationNavigation(notif.type, notif.metadata);
		if (route)
			navigate({
				to: route.to,
				params: (route.params ?? {}) as Record<string, string>,
			});
		if (!notif.isRead) handleMarkRead(notif.id);
	}

	function formatTimestamp(iso: string): string {
		const d = new Date(iso);
		const now = new Date();
		const diff = now.getTime() - d.getTime();
		if (diff < 60_000) return "just now";
		if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
		if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
		return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
	}

	return (
		<div className="mx-auto flex w-full max-w-[640px] flex-col p-4 sm:p-6">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<span className="mono-label text-(--primary-container)">
						// NOTIFICATIONS
					</span>
					<h2 className="font-headline text-2xl text-(--on-surface) sm:text-[32px]">
						Notifications
					</h2>
				</div>
				{unreadIds.length > 0 && (
					<button
						type="button"
						onClick={handleMarkAllRead}
						className="mono-label cursor-pointer border border-(--rule) bg-(--surface-container-low) px-3 py-2 text-[11px] uppercase tracking-[0.05em] text-(--primary) transition-colors duration-150 hover:bg-(--surface-container)"
					>
						Mark All Read
					</button>
				)}
			</div>

			{isLoading && (
				<div className="flex items-center justify-center p-8">
					<p className="font-sans text-[15px] text-(--dim)">Loading...</p>
				</div>
			)}

			{isError && (
				<div className="border border-(--rule) p-4">
					<p className="font-sans text-[13px] text-(--error)">
						{error instanceof Error
							? error.message
							: "Failed to load notifications."}
					</p>
				</div>
			)}

			{!isLoading && !isError && allNotifications.length === 0 && (
				<div className="border border-(--rule) p-8">
					<div className="text-center">
						<p className="font-sans text-[15px] text-(--dim)">
							No notifications yet.
						</p>
						<p className="mt-1 font-sans text-[13px] text-(--dim)">
							Notifications will appear here when there is activity.
						</p>
					</div>
				</div>
			)}

			{!isLoading && !isError && allNotifications.length > 0 && (
				<div className="flex flex-col border border-(--rule)">
					{grouped.map(({ group, items }) => (
						<div key={group}>
							{/* Group Header */}
							<div className="sticky top-0 border-b border-(--rule) bg-(--surface-container-lowest)/90 px-4 py-2 backdrop-blur-sm">
								<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
									{group === "TODAY"
										? "Today"
										: group === "YESTERDAY"
											? "Yesterday"
											: "Earlier"}
								</span>
							</div>

							{items.map((notif: NotificationItem) => {
								const typeConfig = getNotificationTypeConfig(notif.type);

								return (
									<div
										key={notif.id}
										className={`border-b border-(--rule) transition-colors duration-150 ${
											!notif.isRead ? "hover:bg-(--surface-container-low)" : ""
										}`}
									>
										<div className="flex items-start gap-3 p-4">
											{!notif.isRead && (
												<div className="mt-1 w-0.5 shrink-0 self-stretch bg-(--primary)" />
											)}
											<div className="flex min-w-0 flex-1 flex-col gap-1">
												<div className="flex items-center gap-2">
													<span
														className={`mono-label text-[11px] uppercase tracking-[0.05em] ${
															!notif.isRead ? typeConfig.color : "text-(--dim)"
														}`}
													>
														{typeConfig.label}
													</span>
													{!notif.isRead && (
														<span className="h-1.5 w-1.5 rounded-full bg-(--primary)" />
													)}
												</div>
												<button
													type="button"
													onClick={() => handleNotificationClick(notif)}
													className={`w-full text-left ${
														!notif.isRead
															? "font-sans text-[13px] font-medium text-(--on-surface)"
															: "font-sans text-[13px] text-(--dim)"
													}`}
												>
													{notif.message}
												</button>
												<span className="mono-label text-[11px] text-(--dim)">
													{formatTimestamp(notif.createdAt)}
												</span>
											</div>

											<div className="flex flex-col gap-1">
												{!notif.isRead && (
													<button
														type="button"
														onClick={() => handleMarkRead(notif.id)}
														className="mono-label cursor-pointer bg-transparent px-2 py-1 text-[11px] text-(--primary) transition-colors duration-150 hover:text-(--primary-container)"
													>
														Read
													</button>
												)}
												{confirmDelete === notif.id ? (
													<div className="flex gap-1">
														<button
															type="button"
															onClick={() => handleDelete(notif.id)}
															className="mono-label cursor-pointer bg-transparent px-2 py-1 text-[11px] text-(--destructive) transition-colors duration-150"
														>
															Delete
														</button>
														<button
															type="button"
															onClick={() => setConfirmDelete(null)}
															className="mono-label cursor-pointer bg-transparent px-2 py-1 text-[11px] text-(--dim) transition-colors duration-150"
														>
															Cancel
														</button>
													</div>
												) : (
													<button
														type="button"
														onClick={() => setConfirmDelete(notif.id)}
														className="mono-label cursor-pointer bg-transparent px-2 py-1 text-[11px] text-(--dim) transition-colors duration-150 hover:text-(--destructive)"
													>
														Delete
													</button>
												)}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					))}

					<div ref={loadMoreRef} className="flex justify-center p-4">
						{isFetchingNextPage && (
							<span className="mono-label text-[11px] text-(--dim)">
								Loading more...
							</span>
						)}
						{!hasNextPage && allNotifications.length > 0 && (
							<span className="mono-label text-[11px] text-(--dim)">
								All caught up.
							</span>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
