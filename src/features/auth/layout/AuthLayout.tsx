import type { ReactNode } from "react";
import { PressGrid } from "@/shared/components/PressGrid";
import { AuthBrandPanel } from "../components/AuthBrandPanel";

interface AuthLayoutProps {
	children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
	return (
		<div className="flex min-h-dvh w-full overflow-hidden bg-(--surface)">
			<aside
				className="relative hidden w-1/2 shrink-0 overflow-hidden border-r border-(--rule) bg-(--surface-container-lowest) lg:flex lg:flex-col"
				aria-label="PostBoard branding"
			>
				<PressGrid />
				<AuthBrandPanel />
			</aside>
			<main className="flex min-h-dvh flex-1 items-center justify-center overflow-y-auto bg-(--ink) px-8 py-12">
				{children}
			</main>
		</div>
	);
}
