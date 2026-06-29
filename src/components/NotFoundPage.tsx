import { TerminalIcon, Warning } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";

export function NotFoundPage() {
	return (
		<div className="flex min-h-dvh flex-col bg-(--background) font-body selection:bg-(--primary-container) selection:text-(--on-primary-container)">
			<main className="flex flex-grow flex-col items-center justify-center p-6 relative overflow-hidden">
				{/* Ambient grid background lines */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 opacity-20"
				>
					<div className="press-grid-lines h-full w-full" />
				</div>

				<div className="relative z-10 flex w-full max-w-2xl flex-col items-center">
					{/* Broken Press Grid illustration */}
					<div aria-hidden="true" className="relative mb-12">
						<div className="absolute -top-6 left-0 mono-label text-(--dim) uppercase">
							// ERR_VISUAL_RENDER
						</div>
						<div className="grid grid-cols-3 gap-0 border border-(--rule) bg-(--surface-container-lowest)">
							{/* Row 1 */}
							<div className="texture-grain h-20 w-20 border-r border-b border-(--rule) bg-[#C084FC] opacity-80 transition-transform duration-300 hover:scale-[0.98] hover:invert md:h-24 md:w-24" />
							<div className="texture-grain h-20 w-20 border-r border-b border-(--rule) bg-[#60A5FA] opacity-90 transition-transform duration-300 hover:scale-[0.98] hover:invert md:h-24 md:w-24" />
							{/* Broken/empty tile */}
							<div className="flex h-20 w-20 items-center justify-center overflow-hidden border-b border-(--rule) bg-(--background) md:h-24 md:w-24">
								<div className="h-px w-full rotate-45 bg-(--rule)" />
							</div>
							{/* Row 2 */}
							{/* Glitched tile */}
							<div className="glitch-tile texture-grain h-20 w-20 border-r border-(--rule) bg-[#34D399] opacity-70 shadow-[4px_4px_0_0_#1A1A1A] translate-y-2 translate-x-1 md:h-24 md:w-24" />
							{/* Warning icon tile */}
							<div className="flex h-20 w-20 items-center justify-center border-r border-(--rule) bg-(--surface-container) transition-colors hover:bg-(--surface-variant) md:h-24 md:w-24">
								<HugeiconsIcon
									icon={Warning}
									strokeWidth={2}
									className="h-6 w-6 text-(--dim)"
								/>
							</div>
							<div className="texture-grain h-20 w-20 bg-[#F59E0B] opacity-80 transition-transform duration-300 hover:scale-[0.98] hover:invert md:h-24 md:w-24" />
						</div>
						<div className="absolute -bottom-6 right-0 flex gap-4 mono-label text-(--dim) uppercase">
							<span>X: NULL</span>
							<span>Y: NULL</span>
						</div>
					</div>

					{/* Title */}
					<h1 className="font-masthead text-(--on-background) mb-6 text-center uppercase tracking-tighter">
						<span className="inline-block cursor-default text-(--primary-container) transition-transform hover:-translate-y-1">
							404
						</span>
						<span className="mx-2 opacity-50">//</span>
						PAGE_NOT_FOUND
					</h1>

					{/* Rule divider */}
					<div className="mb-6 h-px w-full bg-(--rule)" />

					{/* Description */}
					<div className="mono-label mb-10 max-w-lg text-center uppercase leading-relaxed text-(--body)">
						<p>
							The directory you requested does not exist in our infrastructure
							logs.
						</p>
						<p className="mt-2 inline-block bg-(--surface-container) px-2 py-1 text-(--dim)">
							// TRACE_ID:{" "}
							<span className="text-(--primary)">A7B2-99FX-0000</span>
						</p>
					</div>

					{/* CTAs */}
					<div className="flex w-full flex-col items-center justify-center gap-4 sm:flex-row">
						<Link
							to="/"
							className="group flex w-full items-center justify-center gap-2 border border-(--primary-container) bg-(--primary-container) px-8 py-4 mono-label uppercase text-(--on-primary-container) transition-colors hover:bg-(--background) hover:text-(--primary-container) focus:outline-none focus:ring-1 focus:ring-(--primary-container) focus:ring-offset-1 focus:ring-offset-(--background) sm:w-auto"
						>
							<HugeiconsIcon
								icon={TerminalIcon}
								strokeWidth={2}
								className="h-4 w-4"
							/>
							Return Home
							<span className="ml-2 translate-x-[-10px] opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
								_
							</span>
						</Link>
						<Link
							to="/jobs"
							className="w-full border border-transparent bg-transparent px-8 py-4 mono-label uppercase text-(--body) transition-colors hover:bg-(--surface-container) hover:text-(--on-background) focus:outline-none focus:ring-1 focus:ring-(--body) sm:w-auto"
						>
							Browse Jobs
						</Link>
					</div>
				</div>
			</main>

			{/* Minimal footer */}
			<footer className="relative z-10 flex w-full flex-col items-center justify-between gap-4 border-t border-(--rule) bg-(--surface-container-lowest) p-6 sm:flex-row">
				<div className="mono-label flex items-center gap-2 text-(--dim) uppercase">
					<span className="h-2 w-2 animate-pulse bg-(--error-container) block" />
					// POSTBOARD_SYSTEMS_OFFLINE
				</div>
				<div className="mono-label text-(--dim) uppercase">SYS.VER 4.0.1</div>
			</footer>
		</div>
	);
}
