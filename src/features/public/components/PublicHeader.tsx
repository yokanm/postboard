import {
	ArrowRight01Icon,
	Cancel01Icon,
	Menu01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { ThemeToggle } from "@/shared/components/theme/ThemeToggle";
import { useAuthStore } from "@/stores";

const navLinks = [
	{ to: "/jobs", label: "Jobs" },
	{ to: "/companies", label: "Companies" },
	{ to: "/features", label: "Features" },
	{ to: "/pricing", label: "Pricing" },
	{ to: "/about", label: "About" },
];

export function PublicHeader() {
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
	const location = useLocation();
	const [mobileOpen, setMobileOpen] = useState(false);

	return (
		<header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-(--rule) bg-(--background) px-(--margin) max-w-(--max-width) mx-auto left-0 right-0">
			<div className="flex items-center gap-8">
				<Link
					to="/"
					className="font-masthead text-[28px] uppercase tracking-tighter text-(--primary) leading-none"
				>
					POSTBOARD
				</Link>
				<nav className="hidden md:flex items-center gap-6">
					{navLinks.map((link) => {
						const isActive =
							location.pathname === link.to ||
							(link.to !== "/" && location.pathname.startsWith(link.to));
						return (
							<Link
								key={link.to}
								to={link.to}
								className={`font-ui-sm text-ui-sm whitespace-nowrap transition-colors duration-75 px-2 py-1 ${
									isActive
										? "text-(--primary) border-b border-(--primary) pb-1"
										: "text-(--body) hover:text-(--on-surface) hover:bg-(--surface-variant)"
								}`}
							>
								{link.label}
							</Link>
						);
					})}
				</nav>
			</div>
			<div className="flex items-center gap-4">
				<div className="hidden md:block">
					<ThemeToggle />
				</div>
				{isAuthenticated ? (
					<Link
						to="/candidate/dashboard"
						className="font-ui-sm text-ui-sm text-(--ink) bg-(--press-amber) hover:bg-(--primary-fixed-dim) px-4 py-2 uppercase tracking-wider transition-colors flex items-center gap-2"
					>
						Dashboard
					</Link>
				) : (
					<div className="hidden md:flex items-center gap-3">
						<Link
							to="/register"
							className="font-ui-sm text-ui-sm text-(--body) border border-(--rule) px-4 py-2 uppercase tracking-wider hover:text-(--on-surface) hover:border-(--on-surface) transition-colors"
						>
							Sign Up
						</Link>
						<Link
							to="/register"
							className="font-ui-sm text-ui-sm font-semibold text-(--ink) bg-(--press-amber) hover:bg-(--primary) px-4 py-2 uppercase tracking-wider transition-colors flex items-center gap-2"
						>
							Post a Job
							<HugeiconsIcon
								icon={ArrowRight01Icon}
								strokeWidth={2}
								size={16}
								aria-hidden="true"
							/>
						</Link>
					</div>
				)}
				<button
					type="button"
					className="flex md:hidden items-center justify-center p-2 text-(--body) hover:text-(--on-surface) transition-colors"
					onClick={() => setMobileOpen(!mobileOpen)}
					aria-label={mobileOpen ? "Close menu" : "Open menu"}
					aria-expanded={mobileOpen}
				>
					<HugeiconsIcon
						icon={mobileOpen ? Cancel01Icon : Menu01Icon}
						size={20}
						aria-hidden="true"
					/>
				</button>
			</div>
			{mobileOpen && (
				<div className="absolute top-16 left-0 right-0 z-50 border-b border-(--rule) bg-(--background) md:hidden">
					<nav className="flex flex-col gap-1 px-(--margin) py-4">
						{navLinks.map((link) => {
							const isActive = location.pathname === link.to;
							return (
								<Link
									key={link.to}
									to={link.to}
									onClick={() => setMobileOpen(false)}
									className={`font-ui-sm text-ui-sm py-3 px-2 transition-colors ${
										isActive
											? "text-(--primary) border-l-2 border-(--primary) pl-3"
											: "text-(--body) hover:text-(--on-surface)"
									}`}
								>
									{link.label}
								</Link>
							);
						})}
						<div className="border-t border-(--rule) pt-4 mt-2">
							<div className="mb-4">
								<ThemeToggle />
							</div>
							{isAuthenticated ? (
								<Link
									to="/candidate/dashboard"
									onClick={() => setMobileOpen(false)}
									className="block w-full text-center font-ui-sm text-ui-sm text-(--ink) bg-(--press-amber) px-4 py-3 uppercase tracking-wider transition-colors"
								>
									Dashboard
								</Link>
							) : (
								<div className="flex flex-col gap-3">
									<Link
										to="/register"
										onClick={() => setMobileOpen(false)}
										className="block w-full text-center font-ui-sm text-ui-sm text-(--body) border border-(--rule) px-4 py-3 uppercase tracking-wider transition-colors hover:text-(--on-surface)"
									>
										Sign Up
									</Link>
									<Link
										to="/register"
										onClick={() => setMobileOpen(false)}
										className="block w-full text-center font-ui-sm text-ui-sm font-semibold text-(--ink) bg-(--press-amber) px-4 py-3 uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
									>
										Post a Job
										<HugeiconsIcon
											icon={ArrowRight01Icon}
											strokeWidth={2}
											size={16}
											aria-hidden="true"
										/>
									</Link>
								</div>
							)}
						</div>
					</nav>
				</div>
			)}
		</header>
	);
}
