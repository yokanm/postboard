import { LockIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function MaintenancePage() {
	return (
		<div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-(--background) font-body selection:bg-(--primary-container) selection:text-(--on-primary-container)">
			{/* Background: press-grid lines */}
			<div
				aria-hidden="true"
				className="absolute inset-0 z-0 press-grid-lines opacity-10"
			/>
			{/* Background: scanlines */}
			<div
				aria-hidden="true"
				className="absolute inset-0 z-0 opacity-50 pointer-events-none"
				style={{
					background:
						"linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2))",
					backgroundSize: "100% 4px",
				}}
			/>

			{/* Central content */}
			<main className="relative z-10 flex w-full max-w-3xl flex-col items-center px-6 text-center">
				{/* Status label */}
				<div className="mb-8 flex items-center gap-3">
					<HugeiconsIcon
						icon={LockIcon}
						strokeWidth={2}
						className="h-5 w-5 text-(--primary)"
					/>
					<span className="mono-label tracking-widest uppercase text-(--primary)">
						// SYSTEM_MAINTENANCE
					</span>
				</div>

				{/* Headline */}
				<h1 className="font-headline mb-6 text-(--on-background) md:font-masthead md:text-[clamp(60px,8vw,96px)]">
					The Press is Resting.
				</h1>

				{/* Description */}
				<p className="mb-12 max-w-xl border-l border-(--rule) bg-(--surface-container-lowest)/50 p-4 text-left font-body text-[15px] leading-relaxed text-(--body)">
					PostBoard is currently undergoing scheduled infrastructure updates.
					Expected return:{" "}
					<span className="mono-label ml-1 border border-(--rule) bg-(--surface-container) px-2 py-1 text-(--on-background)">
						08:00 UTC
					</span>
				</p>

				{/* Status indicators */}
				<div className="flex items-center border border-(--rule) bg-(--surface-container) p-4">
					{["API", "DB", "CDN"].map((service, i) => (
						<div key={service} className="flex items-center">
							{i > 0 && <div className="mx-4 h-8 w-px bg-(--rule)" />}
							<div className="flex flex-col items-center">
								<div className="mb-2 h-3 w-3 border border-(--rule) bg-(--muted)" />
								<span className="mono-label text-(--dim)">{service}</span>
							</div>
						</div>
					))}
				</div>
			</main>

			{/* Footer */}
			<footer className="absolute bottom-0 z-10 flex w-full items-center justify-between border-t border-(--rule) bg-(--background)/80 p-6">
				<span className="mono-label uppercase text-(--dim)">
					PostBoard // Infrastructure
				</span>
				<span className="mono-label uppercase text-(--dim)">
					Status: Offline
				</span>
			</footer>
		</div>
	);
}
