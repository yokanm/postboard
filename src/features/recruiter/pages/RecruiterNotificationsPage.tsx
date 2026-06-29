import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TablePaginationFooter } from "@/shared/components/recruiter/TablePaginationFooter";
import { EmptyState } from "@/shared/components/ux/EmptyState";
import { ErrorState } from "@/shared/components/ux/ErrorState";
import {
	useMarkAllNotificationsRead,
	useMarkNotificationRead,
	useRecruiterNotifications,
} from "../hooks";

export function RecruiterNotificationsPage() {
	const [cursor, setCursor] = useState<string | undefined>(undefined);
	const [cursors, setCursors] = useState<string[]>([]);
	const { data, isLoading, isError } = useRecruiterNotifications({ cursor });
	const markRead = useMarkNotificationRead();
	const markAllRead = useMarkAllNotificationsRead();

	const notifications = data?.notifications ?? [];
	const hasNextPage = data?.hasNextPage ?? false;
	const hasPreviousPage = cursors.length > 0;

	function handleNext() {
		if (data?.nextCursor) {
			setCursors((prev) => [...prev, cursor ?? ""]);
			setCursor(data.nextCursor);
		}
	}

	function handlePrevious() {
		const prev = cursors[cursors.length - 1];
		setCursors((prevCursors) => prevCursors.slice(0, -1));
		setCursor(prev || undefined);
	}

	if (isLoading) {
		return (
			<div className="flex flex-col gap-4">
				<Skeleton className="h-8 w-64 bg-(--surface-container-low)" />
				{Array.from({ length: 3 }).map((_, i) => (
					<Skeleton
						key={i}
						className="h-20 w-full bg-(--surface-container-low)"
					/>
				))}
			</div>
		);
	}

	if (isError) {
		return <ErrorState message="Failed to load notifications" />;
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-start justify-between">
				<div>
					<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--primary-container)">
						// NOTIFICATIONS
					</span>
					<h2 className="font-headline mt-2 text-xl text-(--on-surface)">
						Notifications
					</h2>
				</div>
				{notifications.length > 0 && (
					<button
						type="button"
						onClick={() => markAllRead.mutate()}
						disabled={markAllRead.isPending}
						className="mono-label cursor-pointer border border-(--rule) bg-(--surface-container-low) px-4 py-2 text-[11px] uppercase tracking-[0.05em] text-(--dim) transition-colors hover:border-(--on-surface) hover:text-(--on-surface) disabled:opacity-50"
					>
						Mark All Read
					</button>
				)}
			</div>

			{notifications.length === 0 ? (
				<EmptyState
					title="No notifications"
					description="You're all caught up. Notifications will appear here when there's activity."
				/>
			) : (
				<div className="divide-y divide-(--rule) border border-(--rule)">
					{notifications.map((notification) => (
						<div
							key={notification.id}
							className={`flex items-start justify-between gap-4 px-4 py-3 ${
								!notification.isRead ? "bg-(--primary-container)/5" : ""
							}`}
						>
							<div className="flex-1">
								<div className="flex items-center gap-2">
									{!notification.isRead && (
										<span
											className="h-2 w-2 rounded-full bg-(--primary-container)"
											aria-hidden="true"
										/>
									)}
									<p className="font-sans text-[13px] font-medium text-(--on-surface)">
										{notification.title}
									</p>
								</div>
								<p className="mt-0.5 font-sans text-[12px] text-(--body)">
									{notification.message}
								</p>
								<p className="mt-1 font-sans text-[11px] text-(--dim)">
									{new Date(notification.createdAt).toLocaleDateString(
										"en-US",
										{
											month: "short",
											day: "numeric",
											hour: "2-digit",
											minute: "2-digit",
										},
									)}
								</p>
							</div>
							{!notification.isRead && (
								<button
									type="button"
									onClick={() => markRead.mutate(notification.id)}
									disabled={markRead.isPending}
									className="mono-label shrink-0 cursor-pointer border border-(--rule) bg-(--surface-container-low) px-2 py-1 text-[10px] uppercase tracking-[0.05em] text-(--primary-container) transition-colors hover:bg-(--primary-container) hover:text-(--on-primary-container) disabled:opacity-50"
								>
									Read
								</button>
							)}
						</div>
					))}
				</div>
			)}

			<TablePaginationFooter
				hasNextPage={hasNextPage}
				hasPreviousPage={hasPreviousPage}
				onNext={handleNext}
				onPrevious={handlePrevious}
			/>
		</div>
	);
}
