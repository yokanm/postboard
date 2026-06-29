import {
	CheckmarkCircle02Icon,
	Loading03Icon,
	Notification02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { ErrorState } from "@/shared/components/ux/ErrorState";
import { LoadingState } from "@/shared/components/ux/LoadingState";
import {
	useCompanyNotifications,
	useMarkAllNotificationsRead,
	useMarkNotificationRead,
} from "../hooks";
import type { NotificationItem } from "../types";

export function CompanyNotificationsPage() {
	const [cursor, setCursor] = useState<string | undefined>(undefined);
	const [cursorStack, setCursorStack] = useState<string[]>([]);

	const { data, isLoading, isError, refetch } = useCompanyNotifications({
		cursor,
	});
	const markRead = useMarkNotificationRead();
	const markAllRead = useMarkAllNotificationsRead();

	const notifications = data?.notifications ?? [];
	const hasNextPage = data?.hasNextPage ?? false;
	const hasPrevPage = cursorStack.length > 0;
	const unreadCount = notifications.filter((n) => !n.isRead).length;

	function goNext() {
		if (data?.nextCursor) {
			setCursorStack((prev) => [...prev, cursor ?? ""]);
			setCursor(data.nextCursor);
		}
	}

	function goPrev() {
		const prev = [...cursorStack];
		const prevCursor = prev.pop();
		setCursorStack(prev);
		setCursor(prevCursor || undefined);
	}

	if (isLoading) {
		return <LoadingState variant="page" message="Loading notifications..." />;
	}

	if (isError) {
		return (
			<div className="p-4 sm:p-6">
				<ErrorState
					message="Failed to load notifications"
					onRetry={() => refetch()}
				/>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6 p-4 sm:p-6">
			<div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<span className="mono-label text-(--primary-container)">
						// NOTIFICATIONS
					</span>
					<h1 className="font-headline m-0 text-(--on-surface) text-[24px] sm:text-[32px]">
						Notifications
					</h1>
					<p className="font-sans text-[14px] text-(--body)">
						{unreadCount > 0
							? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
							: "All caught up"}
					</p>
				</div>
				{unreadCount > 0 && (
					<button
						type="button"
						onClick={() => markAllRead.mutate()}
						disabled={markAllRead.isPending}
						className="flex items-center gap-1.5 border border-(--rule) px-3 py-1.5 font-sans text-[12px] text-(--on-surface) transition-colors hover:bg-(--surface-container-low) disabled:opacity-50 sm:self-start"
					>
						{markAllRead.isPending ? (
							<HugeiconsIcon
								icon={Loading03Icon}
								strokeWidth={2}
								className="h-3.5 w-3.5 animate-spin"
								aria-hidden="true"
							/>
						) : (
							<HugeiconsIcon
								icon={CheckmarkCircle02Icon}
								strokeWidth={2}
								className="h-3.5 w-3.5"
								aria-hidden="true"
							/>
						)}
						Mark All Read
					</button>
				)}
			</div>

			{notifications.length === 0 ? (
				<div className="flex flex-col items-center justify-center border border-(--rule) px-6 py-16">
					<HugeiconsIcon
						icon={Notification02Icon}
						strokeWidth={2}
						className="h-10 w-10 text-(--muted)"
						aria-hidden="true"
					/>
					<h3 className="mt-4 font-sans text-[15px] font-semibold text-(--on-surface)">
						No notifications
					</h3>
					<p className="mt-1 font-sans text-[13px] text-(--dim)">
						You're all up to date.
					</p>
				</div>
			) : (
				<div className="flex flex-col border border-(--rule)">
					{notifications.map((notif: NotificationItem) => (
						<NotificationCard
							key={notif.id}
							notification={notif}
							onMarkRead={() => markRead.mutate(notif.id)}
						/>
					))}
				</div>
			)}

			{(hasNextPage || hasPrevPage) && (
				<div className="flex items-center justify-center gap-2">
					<button
						type="button"
						onClick={goPrev}
						disabled={!hasPrevPage}
						className="border border-(--rule) px-4 py-1.5 font-sans text-[12px] text-(--on-surface) transition-colors hover:bg-(--surface-container-low) disabled:opacity-50"
					>
						Previous
					</button>
					<button
						type="button"
						onClick={goNext}
						disabled={!hasNextPage}
						className="border border-(--rule) px-4 py-1.5 font-sans text-[12px] text-(--on-surface) transition-colors hover:bg-(--surface-container-low) disabled:opacity-50"
					>
						Next
					</button>
				</div>
			)}
		</div>
	);
}

function NotificationCard({
	notification,
	onMarkRead,
}: {
	notification: NotificationItem;
	onMarkRead: () => void;
}) {
	return (
		<div
			className={`flex items-start gap-3 border-b border-(--rule) px-4 py-3 transition-colors last:border-b-0 ${
				!notification.isRead ? "bg-(--primary-container)/5" : ""
			}`}
		>
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2">
					{!notification.isRead && (
						<span
							className="h-2 w-2 shrink-0 rounded-full bg-(--primary-container)"
							aria-hidden="true"
						/>
					)}
					<h3
						className={`m-0 font-sans text-[13px] ${notification.isRead ? "text-(--on-surface)" : "font-semibold text-(--on-surface)"}`}
					>
						{notification.title}
					</h3>
				</div>
				<p className="mt-0.5 font-sans text-[12px] text-(--dim) line-clamp-2">
					{notification.message}
				</p>
				<span className="mt-1 block font-sans text-[11px] text-(--muted)">
					{new Date(notification.createdAt).toLocaleString()}
				</span>
			</div>
			{!notification.isRead && (
				<button
					type="button"
					onClick={onMarkRead}
					className="shrink-0 cursor-pointer bg-transparent p-1 text-(--dim) hover:text-(--primary-container)"
					aria-label="Mark as read"
				>
					<HugeiconsIcon
						icon={CheckmarkCircle02Icon}
						strokeWidth={2}
						className="h-4 w-4"
						aria-hidden="true"
					/>
				</button>
			)}
		</div>
	);
}
