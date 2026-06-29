import { Menu01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { NotificationsManager } from "@/features/notifications/components/NotificationsManager";
import { ThemeToggle } from "@/shared/components/theme/ThemeToggle";
import { useSidebarStore } from "@/stores";
import { UserMenu } from "./UserMenu";

export function Topbar() {
	const setMobileOpen = useSidebarStore((s) => s.setMobileOpen);

	return (
		<header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-(--rule) bg-(--background) px-4 md:px-6">
			<div className="flex items-center gap-4">
				<button
					type="button"
					className="flex items-center justify-center md:hidden"
					onClick={() => setMobileOpen(true)}
					aria-label="Open navigation menu"
				>
					<HugeiconsIcon
						icon={Menu01Icon}
						strokeWidth={2}
						className="h-5 w-5 text-(--on-surface)"
						aria-hidden="true"
					/>
				</button>

				<div className="hidden md:flex">
					<div className="relative">
						<HugeiconsIcon
							icon={Search01Icon}
							strokeWidth={2}
							className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--dim)"
							aria-hidden="true"
						/>
						<input
							type="search"
							placeholder="Search system..."
							className="h-8 w-64 border border-(--rule) bg-(--background) pl-9 pr-3 text-[13px] text-(--on-surface) placeholder:text-(--muted) focus:border-(--primary-container) focus:outline-none"
						/>
					</div>
				</div>
			</div>

			<div className="flex items-center gap-4">
				<ThemeToggle />
				<NotificationsManager />
				<UserMenu />
			</div>
		</header>
	);
}
