import {
	Analytics01Icon,
	BriefcaseIcon,
	DashboardSquareIcon,
	Notification03Icon,
	Settings02Icon,
	ShieldIcon,
	UserGroupIcon,
	UserIcon,
	UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link, useLocation } from "@tanstack/react-router";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuthStore, useSidebarStore } from "@/stores";

const mobileNavConfig: Record<
	string,
	Array<{ label: string; href: string; icon: typeof DashboardSquareIcon }>
> = {
	CANDIDATE: [
		{
			label: "Overview",
			href: "/candidate/dashboard",
			icon: DashboardSquareIcon,
		},
		{ label: "Jobs", href: "/candidate/jobs", icon: BriefcaseIcon },
		{
			label: "Apps",
			href: "/candidate/applications",
			icon: UserMultiple02Icon,
		},
		{ label: "Profile", href: "/candidate/profile", icon: UserIcon },
		{
			label: "Notifications",
			href: "/candidate/notifications",
			icon: Notification03Icon,
		},
	],
	RECRUITER: [
		{
			label: "Overview",
			href: "/recruiter/dashboard",
			icon: DashboardSquareIcon,
		},
		{ label: "Jobs", href: "/recruiter/jobs", icon: BriefcaseIcon },
		{ label: "Pipeline", href: "/recruiter/jobs", icon: UserMultiple02Icon },
		{ label: "Analytics", href: "/recruiter/analytics", icon: Analytics01Icon },
		{ label: "Profile", href: "/recruiter/profile", icon: UserIcon },
		{ label: "Company", href: "/recruiter/company", icon: UserGroupIcon },
		{
			label: "Notifications",
			href: "/recruiter/notifications",
			icon: Notification03Icon,
		},
	],
	ADMIN: [
		{ label: "Overview", href: "/admin/dashboard", icon: DashboardSquareIcon },
		{ label: "Users", href: "/admin/users", icon: UserGroupIcon },
		{ label: "Jobs", href: "/admin/jobs", icon: BriefcaseIcon },
		{ label: "Companies", href: "/admin/companies", icon: UserMultiple02Icon },
		{ label: "Analytics", href: "/admin/analytics", icon: Analytics01Icon },
		{
			label: "Notifications",
			href: "/admin/notifications",
			icon: Notification03Icon,
		},
	],
	SUPERADMIN: [
		{
			label: "Overview",
			href: "/superadmin/dashboard",
			icon: DashboardSquareIcon,
		},
		{ label: "Users", href: "/superadmin/users", icon: UserGroupIcon },
		{ label: "Jobs", href: "/superadmin/jobs", icon: BriefcaseIcon },
		{
			label: "Companies",
			href: "/superadmin/companies",
			icon: UserMultiple02Icon,
		},
		{ label: "Audit", href: "/superadmin/audit-logs", icon: Analytics01Icon },
		{ label: "Security", href: "/superadmin/security", icon: ShieldIcon },
		{ label: "Platform", href: "/superadmin/platform", icon: Settings02Icon },
	],
};

export function MobileNav() {
	const location = useLocation();
	const isOpen = useSidebarStore((s) => s.isMobileOpen);
	const setMobileOpen = useSidebarStore((s) => s.setMobileOpen);
	const role = useAuthStore((s) => s.role);
	const mobileItems = role
		? (mobileNavConfig[role] ?? mobileNavConfig.CANDIDATE)
		: mobileNavConfig.CANDIDATE;

	return (
		<>
			<Sheet open={isOpen} onOpenChange={setMobileOpen}>
				<SheetContent
					side="left"
					className="w-[220px] border-r-(--rule) bg-(--surface-container-lowest) p-0"
				>
					<SheetTitle className="sr-only">Navigation</SheetTitle>
					<div className="border-b border-(--rule) px-6 py-6">
						<span className="font-serif text-[20px] font-black uppercase tracking-[-0.02em] text-(--on-surface)">
							POSTBOARD
						</span>
					</div>
					<nav className="flex-1 py-4">
						<ul className="flex flex-col gap-0.5 px-2">
							{mobileItems.map((item) => {
								const isActive = location.pathname === item.href;
								return (
									<li key={item.href}>
										<Link
											to={item.href}
											onClick={() => setMobileOpen(false)}
											className={cn(
												"flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
												isActive
													? "border-l-2 border-(--primary-container) bg-(--surface-container) text-(--on-surface)"
													: "border-l-2 border-transparent text-(--body) hover:bg-(--surface-container) hover:text-(--on-surface)",
											)}
										>
											<HugeiconsIcon
												icon={item.icon}
												strokeWidth={isActive ? 2 : 1.5}
												className={cn(
													"h-4 w-4 shrink-0",
													isActive
														? "text-(--primary-container)"
														: "text-(--dim)",
												)}
												aria-hidden="true"
											/>
											<span className="mono-label uppercase tracking-[0.05em]">
												// {item.label.toUpperCase()}
											</span>
										</Link>
									</li>
								);
							})}
						</ul>
					</nav>
				</SheetContent>
			</Sheet>

			<nav
				className="fixed bottom-0 left-0 right-0 z-30 flex h-14 items-center justify-around border-t border-(--rule) bg-(--background) md:hidden"
				aria-label="Mobile navigation"
			>
				{mobileItems.map((item) => {
					const isActive = location.pathname === item.href;
					return (
						<Link
							key={item.href}
							to={item.href}
							className={cn(
								"flex flex-col items-center gap-0.5 px-3 py-1",
								isActive ? "text-(--primary-container)" : "text-(--dim)",
							)}
						>
							<HugeiconsIcon
								icon={item.icon}
								strokeWidth={isActive ? 2 : 1.5}
								className="h-5 w-5"
								aria-hidden="true"
							/>
							<span className="mono-label text-[9px] uppercase tracking-[0.05em]">
								{item.label}
							</span>
						</Link>
					);
				})}
			</nav>
		</>
	);
}
