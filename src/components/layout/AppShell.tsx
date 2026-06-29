import type { ReactNode } from "react";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface AppShellProps {
	children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
	return (
		<div className="flex min-h-dvh bg-(--background)">
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:border focus:border-(--rule) focus:bg-(--background) focus:px-4 focus:py-2 focus:text-[13px] focus:text-(--on-surface) focus:outline-2 focus:outline-offset-2 focus:outline-(--primary-container)"
			>
				Skip to main content
			</a>
			<Sidebar />
			<div className="flex flex-1 flex-col md:ml-[220px]">
				<Topbar />
				<main
					id="main-content"
					className="flex-1 overflow-y-auto"
					tabIndex={-1}
				>
					{children}
				</main>
				<MobileNav />
			</div>
		</div>
	);
}
