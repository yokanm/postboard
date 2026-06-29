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
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores";

interface NavItem {
	label: string;
	href: string;
	icon: IconSvgElement;
}

const navConfig: Record<string, NavItem[]> = {
	CANDIDATE: [
		{
			label: "Dashboard",
			href: "/candidate/dashboard",
			icon: DashboardSquareIcon,
		},
		{ label: "Jobs", href: "/candidate/jobs", icon: BriefcaseIcon },
		{
			label: "Applications",
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
			label: "Dashboard",
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
		{ label: "Dashboard", href: "/admin/dashboard", icon: DashboardSquareIcon },
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
			label: "Dashboard",
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
		{
			label: "Audit Logs",
			href: "/superadmin/audit-logs",
			icon: Analytics01Icon,
		},
		{ label: "Security", href: "/superadmin/security", icon: ShieldIcon },
		{ label: "Platform", href: "/superadmin/platform", icon: Settings02Icon },
	],
};

export function Sidebar() {
	const location = useLocation();
	const role = useAuthStore((s) => s.role);
	const items = role
		? (navConfig[role] ?? navConfig.CANDIDATE)
		: navConfig.CANDIDATE;

	return (
		<aside
			className="fixed left-0 top-0 z-40 hidden h-dvh w-[220px] flex-col border-r border-(--rule) bg-(--surface-container-lowest) md:flex"
			aria-label="Main navigation"
		>
			<div className="border-b border-(--rule) px-6 py-6">
				<span className="font-serif text-[20px] font-black uppercase tracking-[-0.02em] text-(--on-surface)">
					POSTBOARD
				</span>
				<p className="mono-label mt-1 text-(--dim) uppercase">
					// TECHNICAL_RECRUITMENT
				</p>
			</div>

			<nav className="flex-1 overflow-y-auto py-4">
				<ul className="flex flex-col gap-0.5 px-2">
					{items.map((item) => {
						const isActive = location.pathname === item.href;
						return (
							<li key={item.href}>
								<Link
									to={item.href}
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
											isActive ? "text-(--primary-container)" : "text-(--dim)",
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

			<div className="border-t border-(--rule) px-4 py-4">
				<div className="flex items-center gap-2">
					<div className="h-2 w-2 shrink-0 rounded-full bg-(--live)" />
					<span className="mono-label text-[10px] uppercase tracking-widest text-(--dim)">
						SESSION_ACTIVE
					</span>
				</div>
			</div>
		</aside>
	);
}
