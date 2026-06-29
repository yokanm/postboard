import { SquareIcon, TerminalIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function PricingPage() {
	return (
		<main className="w-full flex-1">
			<section className="relative mx-auto max-w-(--max-width) overflow-hidden border-b border-(--rule) px-(--margin) py-[120px] md:py-[180px]">
				<div
					className="pointer-events-none absolute inset-0 opacity-[0.03]"
					style={{
						backgroundImage:
							"radial-gradient(circle at 1px 1px, var(--on-surface) 1px, transparent 0)",
						backgroundSize: "24px 24px",
					}}
				/>
				<div className="relative z-10 max-w-4xl">
					<div className="mb-8 inline-flex items-center gap-2 border border-(--rule) bg-(--surface-container-low) px-3 py-1">
						<span className="text-(--primary)" aria-hidden="true">
							<HugeiconsIcon
								icon={TerminalIcon}
								strokeWidth={2}
								className="h-[14px] w-[14px]"
							/>
						</span>
						<span className="font-mono-label text-mono-label text-(--dim) uppercase tracking-widest">
							// PRICING_ROADMAP
						</span>
					</div>
					<h1 className="font-masthead text-(--on-surface) mb-8">
						The Future of Hiring.
					</h1>
					<p className="font-ui-xl text-ui-xl text-(--body) max-w-2xl border-l-2 border-(--press-amber) pl-4">
						Access next-generation talent acquisition tools. Transparent
						pricing, technical precision, and zero friction. Choose your
						trajectory.
					</p>
				</div>
			</section>
			<section className="mx-auto max-w-(--max-width) px-(--margin) py-(--section-v-pad)">
				<div className="grid grid-cols-1 border border-(--rule) bg-(--surface) md:grid-cols-3">
					<div className="flex flex-col border-b border-(--rule) p-8 md:border-b-0 md:border-r">
						<div className="mb-8">
							<div className="mb-4 inline-block border border-dashed border-(--rule) px-2 py-1">
								<span className="font-mono-label text-mono-label text-(--dim) uppercase">
									COMING_SOON
								</span>
							</div>
							<h2 className="font-ui-xl text-ui-xl text-(--on-surface) mb-2">
								Candidate
							</h2>
							<p className="font-ui-sm text-ui-sm text-(--dim) mb-4">
								For individual talent navigating the technical landscape.
							</p>
							<div className="font-headline text-headline text-(--on-background)">
								Free
							</div>
						</div>
						<div className="mb-8 border-t border-(--rule) pt-6">
							<span className="mono-label mb-4 block text-(--dim) uppercase">
								// HIGHLIGHTS
							</span>
							<ul className="space-y-3 font-body text-body text-(--body)">
								{[
									"Smart Discovery",
									"Applied Tracking",
									"Public Profile Matrix",
								].map((item) => (
									<li key={item} className="flex items-start gap-2">
										<span className="text-(--press-amber)">
											<HugeiconsIcon
												icon={SquareIcon}
												strokeWidth={3}
												className="h-3 w-3 mt-1"
											/>
										</span>
										<span>{item}</span>
									</li>
								))}
							</ul>
						</div>
						<span className="w-full border border-(--rule) bg-transparent py-3 font-mono-label text-mono-label text-(--secondary) text-center uppercase cursor-not-allowed opacity-50">
							Notify Me
						</span>
					</div>
					<div className="relative flex flex-col border-b border-(--rule) bg-(--surface-container-low) p-8 md:border-b-0 md:border-r">
						<div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-(--gradient-d) to-(--primary)" />
						<div className="mb-8">
							<div className="mb-4 inline-block border border-dashed border-(--primary) bg-(--primary)/10 px-2 py-1">
								<span className="font-mono-label text-mono-label text-(--primary) uppercase">
									COMING_SOON
								</span>
							</div>
							<h2 className="font-ui-xl text-ui-xl text-(--on-surface) mb-2">
								Recruiter
							</h2>
							<p className="font-ui-sm text-ui-sm text-(--dim) mb-4">
								Professional tier for scouting and pipeline management.
							</p>
							<div className="font-headline text-headline text-(--on-background)">
								Pro
							</div>
						</div>
						<div className="mb-8 border-t border-(--rule) pt-6">
							<span className="mono-label mb-4 block text-(--dim) uppercase">
								// HIGHLIGHTS
							</span>
							<ul className="space-y-3 font-body text-body text-(--body)">
								{[
									"Pipeline Management",
									"Advanced Filters",
									"Automated Sourcing",
								].map((item) => (
									<li key={item} className="flex items-start gap-2">
										<span className="text-(--press-amber)">
											<HugeiconsIcon
												icon={SquareIcon}
												strokeWidth={3}
												className="h-3 w-3 mt-1"
											/>
										</span>
										<span>{item}</span>
									</li>
								))}
							</ul>
						</div>
						<span className="w-full border border-(--primary) bg-(--primary) py-3 font-mono-label text-mono-label text-(--on-primary) text-center uppercase cursor-not-allowed opacity-70">
							Notify Me
						</span>
					</div>
					<div className="flex flex-col p-8">
						<div className="mb-8">
							<div className="mb-4 inline-block border border-dashed border-(--rule) px-2 py-1">
								<span className="font-mono-label text-mono-label text-(--dim) uppercase">
									COMING_SOON
								</span>
							</div>
							<h2 className="font-ui-xl text-ui-xl text-(--on-surface) mb-2">
								Enterprise
							</h2>
							<p className="font-ui-sm text-ui-sm text-(--dim) mb-4">
								Custom deployment for large scale engineering orgs.
							</p>
							<div className="font-headline text-headline text-(--on-background)">
								Custom
							</div>
						</div>
						<div className="mb-8 border-t border-(--rule) pt-6">
							<span className="mono-label mb-4 block text-(--dim) uppercase">
								// HIGHLIGHTS
							</span>
							<ul className="space-y-3 font-body text-body text-(--body)">
								{["SSO Integration", "Audit Logs", "Dedicated Support"].map(
									(item) => (
										<li key={item} className="flex items-start gap-2">
											<span className="text-(--press-amber)">
												<HugeiconsIcon
													icon={SquareIcon}
													strokeWidth={3}
													className="h-3 w-3 mt-1"
												/>
											</span>
											<span>{item}</span>
										</li>
									),
								)}
							</ul>
						</div>
						<span className="w-full border border-(--rule) bg-transparent py-3 font-mono-label text-mono-label text-(--secondary) text-center uppercase cursor-not-allowed opacity-50">
							Contact Sales
						</span>
					</div>
				</div>
			</section>
			<section className="mx-auto max-w-(--max-width) px-(--margin) py-(--section-v-pad) mb-16">
				<div className="mx-auto max-w-xl border border-(--rule) bg-(--surface) p-8 text-center md:p-12">
					<h3 className="font-ui-xl text-ui-xl text-(--on-surface) mb-2">
						Secure Early Access
					</h3>
					<p className="font-body text-body text-(--body) mb-8">
						Join the waitlist to receive priority access when PostBoard
						launches. Limited seats available in the alpha cohort.
					</p>
					<div className="flex flex-col border border-(--rule) sm:flex-row">
						<input
							type="email"
							placeholder="ENTER_EMAIL_ADDRESS"
							className="flex-1 border-none bg-(--background) p-4 font-mono-label text-mono-label text-(--on-background) placeholder:text-(--dim) focus:outline-none focus:ring-0"
							aria-label="Email address"
						/>
						<button
							type="submit"
							className="whitespace-nowrap bg-(--primary) px-8 py-4 font-mono-label text-mono-label text-(--on-primary) uppercase transition-colors hover:bg-(--primary-container)"
						>
							Join Waitlist
						</button>
					</div>
					<p className="mono-label mt-4 text-[10px] text-(--dim) uppercase">
						// NO_SPAM_PROMISE
					</p>
				</div>
			</section>
		</main>
	);
}
