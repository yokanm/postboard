import {
	Analytics01Icon,
	BriefcaseIcon,
	DashboardSquareIcon,
	Logout03Icon,
	Menu01Icon,
	Settings02Icon,
	ShieldIcon,
	UserGroupIcon,
	UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useSuperAdminAuthStore } from "@/stores";

const navItems = [
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
];

interface SuperAdminLayoutProps {
	children: ReactNode;
}

export function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
	const location = useLocation();
	const navigate = useNavigate();
	const { admin, clearAuth } = useSuperAdminAuthStore();
	const [mobileOpen, setMobileOpen] = useState(false);

	function handleLogout() {
		clearAuth();
		navigate({ to: "/superadmin/login" });
	}

	return (
		<div className="flex min-h-dvh bg-(--background)">
			{/* Mobile Nav Drawer */}
			<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
				<SheetContent
					side="left"
					className="w-[240px] border-r-(--rule) bg-(--surface-container-low) p-0"
				>
					<SheetTitle className="sr-only">SuperAdmin Navigation</SheetTitle>
					<div className="flex h-14 items-center border-b border-(--rule) px-5">
						<span className="mono-label text-[11px] uppercase tracking-[0.1em] text-(--primary-container)">
							// SUPERADMIN
						</span>
					</div>
					<nav className="flex-1 overflow-y-auto p-3">
						{navItems.map((item) => {
							const isActive = location.pathname === item.href;
							return (
								<Link
									key={item.href}
									to={item.href}
									onClick={() => setMobileOpen(false)}
									className={cn(
										"flex items-center gap-3 px-3 py-2.5 font-sans text-[13px] transition-colors",
										isActive
											? "border-l-2 border-(--primary) bg-(--surface-container) text-(--on-surface)"
											: "text-(--dim) hover:bg-(--surface-container) hover:text-(--on-surface)",
									)}
								>
									<HugeiconsIcon icon={item.icon} size={16} />
									{item.label}
								</Link>
							);
						})}
					</nav>
					<div className="border-t border-(--rule) p-3">
						<div className="mb-2 px-3 py-2">
							<p className="font-sans text-[12px] text-(--dim)">
								{admin?.firstName} {admin?.lastName}
							</p>
							<p className="font-sans text-[11px] text-(--dim) opacity-60">
								{admin?.email}
							</p>
						</div>
						<button
							type="button"
							onClick={handleLogout}
							className="flex w-full items-center gap-3 px-3 py-2.5 font-sans text-[13px] text-(--error) transition-colors hover:bg-(--error)/10"
						>
							<HugeiconsIcon icon={Logout03Icon} size={16} />
							Logout
						</button>
					</div>
				</SheetContent>
			</Sheet>

			{/* Desktop Sidebar */}
			<aside className="hidden w-[240px] flex-col border-r border-(--rule) bg-(--surface-container-low) md:flex">
				<div className="flex h-14 items-center border-b border-(--rule) px-5">
					<span className="mono-label text-[11px] uppercase tracking-[0.1em] text-(--primary-container)">
						// SUPERADMIN
					</span>
				</div>

				<nav className="flex-1 overflow-y-auto p-3">
					{navItems.map((item) => {
						const isActive = location.pathname === item.href;
						return (
							<Link
								key={item.href}
								to={item.href}
								className={cn(
									"flex items-center gap-3 px-3 py-2.5 font-sans text-[13px] transition-colors",
									isActive
										? "border-l-2 border-(--primary) bg-(--surface-container) text-(--on-surface)"
										: "text-(--dim) hover:bg-(--surface-container) hover:text-(--on-surface)",
								)}
							>
								<HugeiconsIcon icon={item.icon} size={16} />
								{item.label}
							</Link>
						);
					})}
				</nav>

				<div className="border-t border-(--rule) p-3">
					<div className="mb-2 px-3 py-2">
						<p className="font-sans text-[12px] text-(--dim)">
							{admin?.firstName} {admin?.lastName}
						</p>
						<p className="font-sans text-[11px] text-(--dim) opacity-60">
							{admin?.email}
						</p>
					</div>
					<button
						type="button"
						onClick={handleLogout}
						className="flex w-full items-center gap-3 px-3 py-2.5 font-sans text-[13px] text-(--error) transition-colors hover:bg-(--error)/10"
					>
						<HugeiconsIcon icon={Logout03Icon} size={16} />
						Logout
					</button>
				</div>
			</aside>

			<div className="flex flex-1 flex-col">
				{/* Mobile Header */}
				<header className="flex h-14 items-center justify-between border-b border-(--rule) bg-(--surface-container-lowest) px-5 md:hidden">
					<button
						type="button"
						onClick={() => setMobileOpen(true)}
						className="flex items-center gap-2 text-(--dim) hover:text-(--on-surface)"
						aria-label="Open navigation"
					>
						<HugeiconsIcon icon={Menu01Icon} size={20} />
					</button>
					<span className="font-sans text-[13px] text-(--dim)">
						Platform Governance
					</span>
				</header>

				{/* Desktop Header */}
				<header className="hidden h-14 items-center border-b border-(--rule) bg-(--surface-container-lowest) px-5 md:flex">
					<span className="font-sans text-[13px] text-(--dim)">
						Platform Governance
					</span>
				</header>

				<main className="flex-1 overflow-y-auto">{children}</main>
			</div>
		</div>
	);
}
