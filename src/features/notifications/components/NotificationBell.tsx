import { useUnreadCount } from "../hooks";

interface NotificationBellProps {
	onClick: () => void;
}

export function NotificationBell({ onClick }: NotificationBellProps) {
	const { data, isLoading } = useUnreadCount();
	const count = data?.unreadCount ?? 0;

	return (
		<button
			type="button"
			onClick={onClick}
			className="relative flex h-8 w-8 items-center justify-center border border-(--rule) bg-(--surface-container-low) transition-colors duration-150 hover:bg-(--surface-container)"
			aria-label={`Notifications${count > 0 ? `, ${count} unread` : ""}`}
		>
			<svg
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="text-(--body)"
			>
				<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
				<path d="M13.73 21a2 2 0 0 1-3.46 0" />
			</svg>

			{!isLoading && count > 0 && (
				<span className="absolute -right-1 -top-1 flex min-w-[18px] items-center justify-center border border-(--destructive) bg-(--destructive) px-1 font-sans text-[10px] font-bold leading-[14px] text-white">
					{count > 99 ? "99+" : count}
				</span>
			)}
		</button>
	);
}
