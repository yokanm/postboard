import {
	Analytics01Icon,
	DashboardCircleIcon,
	HistoryIcon,
	Notification02Icon,
	Settings03Icon,
	UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link, useMatchRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface NavItem {
	to: string;
	label: string;
	icon: typeof DashboardCircleIcon;
}

const navItems: NavItem[] = [
	{ to: "/company", label: "Dashboard", icon: DashboardCircleIcon },
	{ to: "/company/profile", label: "Profile", icon: Settings03Icon },
	{ to: "/company/team", label: "Team", icon: UserMultiple02Icon },
	{ to: "/company/analytics", label: "Analytics", icon: Analytics01Icon },
	{ to: "/company/audit-logs", label: "Audit Logs", icon: HistoryIcon },
	{
		to: "/company/notifications",
		label: "Notifications",
		icon: Notification02Icon,
	},
];

interface CompanyLayoutProps {
	children: ReactNode;
}

export function CompanyLayout({ children }: CompanyLayoutProps) {
	const matchRoute = useMatchRoute();

	return (
		<div className="flex min-h-[calc(100dvh-64px)]">
			<nav
				className="hidden w-56 shrink-0 border-r border-(--rule) bg-(--surface-container-low) p-4 md:flex md:flex-col md:gap-1"
				aria-label="Company administration navigation"
			>
				<div className="mb-4 px-3">
					<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--primary-container)">
						// COMPANY
					</span>
				</div>
				{navItems.map((item) => {
					const isActive = matchRoute({
						to: item.to,
						fuzzy: item.to === "/company" ? false : true,
					});
					return (
						<Link
							key={item.to}
							to={item.to}
							className={`flex items-center gap-2.5 px-3 py-2 font-sans text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-(--primary-container) ${
								isActive
									? "bg-(--primary-container)/10 text-(--primary-container)"
									: "text-(--dim) hover:bg-(--surface-container) hover:text-(--on-surface)"
							}`}
							aria-current={isActive ? "page" : undefined}
						>
							<HugeiconsIcon
								icon={item.icon}
								strokeWidth={2}
								className="h-4 w-4 shrink-0"
								aria-hidden="true"
							/>
							{item.label}
						</Link>
					);
				})}
			</nav>

			{/* Mobile sub-navigation */}
			<div className="flex flex-1 flex-col">
				<div
					className="flex gap-1 overflow-x-auto border-b border-(--rule) px-3 md:hidden"
					role="tablist"
					aria-label="Company sections"
				>
					{navItems.map((item) => {
						const isActive = matchRoute({
							to: item.to,
							fuzzy: item.to === "/company" ? false : true,
						});
						return (
							<Link
								key={item.to}
								to={item.to}
								className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 font-sans text-[12px] transition-colors ${
									isActive
										? "border-(--primary-container) text-(--primary-container)"
										: "border-transparent text-(--dim) hover:text-(--on-surface)"
								}`}
								aria-current={isActive ? "page" : undefined}
							>
								<HugeiconsIcon
									icon={item.icon}
									strokeWidth={2}
									className="h-3.5 w-3.5"
									aria-hidden="true"
								/>
								<span className="whitespace-nowrap">{item.label}</span>
							</Link>
						);
					})}
				</div>
				<div className="flex-1 overflow-y-auto">{children}</div>
			</div>
		</div>
	);
}
