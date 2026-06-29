import { SquareIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";

export function LandingPage() {
	return (
		<main className="flex-grow">
			<section className="relative flex min-h-[921px] flex-col items-center justify-center overflow-hidden px-4 text-center">
				<div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-30">
					<div className="grid w-full max-w-4xl grid-cols-6 grid-rows-4 gap-1 opacity-40">
						{Array.from({ length: 24 }).map((_, i) => {
							const gradients = [
								"bg-gradient-to-br from-(--gradient-a) to-(--gradient-b)",
								"bg-gradient-to-br from-(--gradient-c) to-(--gradient-d)",
								"bg-gradient-to-br from-(--gradient-d) to-(--destructive)",
								"bg-gradient-to-br from-(--gradient-b) to-(--gradient-c)",
							];
							const g = gradients[i % gradients.length];
							return (
								<div
									// biome-ignore lint/suspicious/noArrayIndexKey: static decorative tiles
									key={i}
									className={`aspect-square ${g} press-grid-tile pointer-events-auto cursor-crosshair`}
								/>
							);
						})}
					</div>
				</div>
				<div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center">
					<span className="mono-label mb-6 text-(--dim) uppercase tracking-wider">
						// find_your_next_role
					</span>
					<h1 className="font-masthead text-(--on-surface) mb-6">The Board.</h1>
					<p className="font-headline text-[32px] italic font-normal text-(--body) mb-12">
						Where serious companies post.
					</p>
					<div className="mb-16 flex flex-col gap-4 sm:flex-row">
						<Link
							to="/jobs"
							className="bg-(--press-amber) text-(--ink) px-8 py-4 font-ui-lg font-bold hover:bg-[#d65a09] transition-colors border border-(--press-amber)"
						>
							Browse Roles
						</Link>
						<Link
							to="/register"
							className="bg-transparent text-(--body) px-8 py-4 font-ui-lg border border-(--rule) hover:text-(--on-surface) hover:border-(--on-surface) transition-colors"
						>
							Post a Job
						</Link>
					</div>
					<div className="flex flex-col items-center">
						<span className="mono-label mb-6 text-(--dim) uppercase">
							// trusted_by
						</span>
						<div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale transition-all duration-500 hover:grayscale-0">
							{["LOGO_1", "LOGO_2", "LOGO_3", "LOGO_4", "LOGO_5"].map(
								(logo, i) => (
									<div
										key={logo}
										className={`bg-(--surface-variant) flex h-8 w-24 items-center justify-center font-mono-label text-xs ${i >= 3 ? "hidden sm:flex" : ""} ${i >= 4 ? "hidden md:flex" : ""}`}
									>
										{logo}
									</div>
								),
							)}
						</div>
					</div>
				</div>
			</section>
			<section className="w-full border-y border-(--rule) bg-(--ink) py-12">
				<div className="mx-auto grid max-w-(--max-width) grid-cols-1 px-(--margin) md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x border-(--rule)">
					<div className="flex flex-col items-center px-4 py-4 text-center md:py-0">
						<span className="font-headline text-[48px] font-extrabold text-(--press-amber) mb-2">
							8,400+
						</span>
						<span className="mono-label text-(--dim) uppercase">
							Open Roles
						</span>
					</div>
					<div className="flex flex-col items-center px-4 py-4 text-center md:py-0">
						<span className="font-headline text-[48px] font-extrabold text-(--press-amber) mb-2">
							142
						</span>
						<span className="mono-label text-(--dim) uppercase">Companies</span>
					</div>
					<div className="flex flex-col items-center px-4 py-4 text-center md:py-0">
						<span className="font-headline text-[48px] font-extrabold text-(--press-amber) mb-2">
							72hrs
						</span>
						<span className="mono-label text-(--dim) uppercase">
							Avg. Time to Hire
						</span>
					</div>
				</div>
			</section>
			<section className="mx-auto flex max-w-(--max-width) flex-col gap-32 px-(--margin) py-(--section-v-pad) my-16">
				<div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
					<div className="flex flex-col">
						<span className="mono-label mb-4 text-(--dim) uppercase">
							// for_candidates
						</span>
						<h2 className="font-headline text-headline text-(--on-surface) mb-6">
							Smart Applications.
						</h2>
						<p className="font-body text-body text-(--body) mb-8">
							Stop submitting into the void. Track your application status in
							real-time, communicate directly with hiring managers, and keep
							your professional profile updated with our unified portal.
						</p>
						<ul className="flex flex-col gap-3 font-ui-sm text-(--secondary)">
							<li className="flex items-center gap-2">
								<span className="text-(--press-amber)">
									<HugeiconsIcon
										icon={SquareIcon}
										strokeWidth={3}
										className="h-3 w-3"
									/>
								</span>{" "}
								Real-time status tracking
							</li>
							<li className="flex items-center gap-2">
								<span className="text-(--press-amber)">
									<HugeiconsIcon
										icon={SquareIcon}
										strokeWidth={3}
										className="h-3 w-3"
									/>
								</span>{" "}
								Direct recruiter messaging
							</li>
							<li className="flex items-center gap-2">
								<span className="text-(--press-amber)">
									<HugeiconsIcon
										icon={SquareIcon}
										strokeWidth={3}
										className="h-3 w-3"
									/>
								</span>{" "}
								One-click applying
							</li>
						</ul>
					</div>
					<div className="border border-(--rule) bg-(--surface) p-6 aspect-video flex flex-col relative overflow-hidden group">
						<div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-(--surface)/50 to-transparent" />
						<div className="relative z-10 mb-6 flex items-center justify-between border-b border-(--rule) pb-4">
							<span className="mono-label text-xs text-(--dim)">
								// APPLICATION_STATUS
							</span>
							<span className="border border-(--live)/20 bg-(--live-dim) text-(--live) px-2 py-1 font-mono-label text-[10px]">
								[INTERVIEWING]
							</span>
						</div>
						<div className="relative z-10 flex flex-col gap-6">
							<div className="flex flex-col gap-3">
								<div className="flex items-center justify-between font-ui-sm text-(--secondary)">
									<div className="flex items-center gap-2">
										<span className="text-(--press-amber) text-sm">
											&#10003;
										</span>
										<span>Initial Screen</span>
									</div>
									<span className="font-mono-label text-[10px] opacity-50">
										COMPLETED
									</span>
								</div>
								<div className="flex items-center justify-between font-ui-sm text-(--secondary)">
									<div className="flex items-center gap-2">
										<span className="text-(--press-amber) text-sm">
											&#10003;
										</span>
										<span>Technical Assessment</span>
									</div>
									<span className="font-mono-label text-[10px] opacity-50">
										COMPLETED
									</span>
								</div>
							</div>
							<div className="border-t border-(--rule) pt-4">
								<div className="mb-4 flex flex-col gap-1">
									<span className="font-mono-label text-[10px] text-(--dim) uppercase tracking-wider">
										Current Stage
									</span>
									<div className="flex items-end justify-between">
										<span className="font-ui-lg text-(--on-surface)">
											Technical Interview
										</span>
										<span className="font-mono-label text-[10px] text-(--press-amber)">
											TODAY @ 14:00
										</span>
									</div>
								</div>
								<div className="border border-(--rule) bg-(--surface-container) p-3">
									<div className="flex items-center gap-2">
										<span className="text-(--dim) text-sm">&#8594;</span>
										<span className="font-mono-label text-[10px] text-(--dim) uppercase">
											Next Step:
										</span>
										<span className="font-ui-sm text-(--on-surface)">
											Final Partner Review
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
					<div className="order-2 lg:order-1 border border-(--rule) bg-(--surface) p-6 aspect-video flex flex-col relative overflow-hidden">
						<div className="relative z-10 flex h-full gap-3">
							<div className="flex flex-1 flex-col gap-3">
								<span className="font-mono-label text-[11px] text-(--dim) uppercase tracking-wider">
									// applied
								</span>
								<div className="flex flex-col gap-2">
									<div className="flex flex-col gap-1 border border-(--rule) bg-(--ink) p-3">
										<span className="font-ui-sm font-semibold text-(--on-surface)">
											Sarah Chen
										</span>
										<span className="font-mono-label text-[11px] text-(--dim)">
											// sr_eng
										</span>
									</div>
									<div className="flex flex-col gap-1 border border-(--rule) bg-(--ink) p-3 opacity-50">
										<span className="font-ui-sm font-semibold text-(--on-surface)">
											Alex Rivera
										</span>
										<span className="font-mono-label text-[11px] text-(--dim)">
											// product_mgr
										</span>
									</div>
								</div>
							</div>
							<div className="flex flex-1 flex-col gap-3">
								<span className="font-mono-label text-[11px] text-(--dim) uppercase tracking-wider">
									// interviewing
								</span>
								<div className="flex flex-col gap-2">
									<div className="flex flex-col gap-1 border border-(--rule) border-l-(--press-amber) bg-(--ink) p-3">
										<span className="font-ui-sm font-semibold text-(--on-surface)">
											Marcus Bell
										</span>
										<span className="font-mono-label text-[11px] text-(--dim)">
											// lead_designer
										</span>
									</div>
								</div>
							</div>
							<div className="flex flex-1 flex-col gap-3">
								<span className="font-mono-label text-[11px] text-(--dim) uppercase tracking-wider">
									// offer
								</span>
								<div className="flex flex-col gap-2">
									<div className="flex flex-col gap-1 border border-(--rule) bg-(--ink) p-3">
										<span className="font-ui-sm font-semibold text-(--on-surface)">
											Jordan Smith
										</span>
										<span className="font-mono-label text-[11px] text-(--dim)">
											// backend_dev
										</span>
									</div>
								</div>
							</div>
						</div>
						<div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-(--surface)/50 to-transparent" />
					</div>
					<div className="order-1 lg:order-2 flex flex-col">
						<span className="mono-label mb-4 text-(--dim) uppercase">
							// for_recruiters
						</span>
						<h2 className="font-headline text-headline text-(--on-surface) mb-6">
							Kanban Pipeline.
						</h2>
						<p className="font-body text-body text-(--body) mb-8">
							Manage applicants with surgical precision. Drag and drop
							candidates through customized stages, leave internal notes, and
							schedule interviews without leaving the board.
						</p>
						<ul className="flex flex-col gap-3 font-ui-sm text-(--secondary)">
							<li className="flex items-center gap-2">
								<span className="text-(--press-amber)">
									<HugeiconsIcon
										icon={SquareIcon}
										strokeWidth={3}
										className="h-3 w-3"
									/>
								</span>{" "}
								Visual candidate tracking
							</li>
							<li className="flex items-center gap-2">
								<span className="text-(--press-amber)">
									<HugeiconsIcon
										icon={SquareIcon}
										strokeWidth={3}
										className="h-3 w-3"
									/>
								</span>{" "}
								Internal team notes
							</li>
							<li className="flex items-center gap-2">
								<span className="text-(--press-amber)">
									<HugeiconsIcon
										icon={SquareIcon}
										strokeWidth={3}
										className="h-3 w-3"
									/>
								</span>{" "}
								Automated stage actions
							</li>
						</ul>
					</div>
				</div>
				<div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
					<div className="flex flex-col">
						<span className="mono-label mb-4 text-(--dim) uppercase">
							// for_teams
						</span>
						<h2 className="font-headline text-headline text-(--on-surface) mb-6">
							Multi-seat &amp; Audit.
						</h2>
						<p className="font-body text-body text-(--body) mb-8">
							Built for enterprise compliance. Granular role permissions, full
							action audit trails, and multi-user seat management ensure your
							hiring process is secure and transparent.
						</p>
						<ul className="flex flex-col gap-3 font-ui-sm text-(--secondary)">
							<li className="flex items-center gap-2">
								<span className="text-(--press-amber)">
									<HugeiconsIcon
										icon={SquareIcon}
										strokeWidth={3}
										className="h-3 w-3"
									/>
								</span>{" "}
								Granular RBAC
							</li>
							<li className="flex items-center gap-2">
								<span className="text-(--press-amber)">
									<HugeiconsIcon
										icon={SquareIcon}
										strokeWidth={3}
										className="h-3 w-3"
									/>
								</span>{" "}
								Comprehensive audit logs
							</li>
							<li className="flex items-center gap-2">
								<span className="text-(--press-amber)">
									<HugeiconsIcon
										icon={SquareIcon}
										strokeWidth={3}
										className="h-3 w-3"
									/>
								</span>{" "}
								Unlimited recruiter seats
							</li>
						</ul>
					</div>
					<div className="border border-(--rule) bg-(--surface) p-6 aspect-video flex flex-col relative overflow-hidden">
						<div className="relative z-10 flex flex-col gap-2 font-mono-label text-xs">
							<div className="flex justify-between border-b border-(--rule) pb-2 text-(--dim)">
								<span>TIMESTAMP</span>
								<span>USER</span>
								<span>ACTION</span>
							</div>
							<div className="flex justify-between border-b border-(--rule) py-2 text-(--body)">
								<span>10:42:01</span>
								<span className="text-(--secondary)">admin_jane</span>
								<span>UPDATE_ROLE_PERM</span>
							</div>
							<div className="flex justify-between border-b border-(--rule) py-2 text-(--body)">
								<span>09:15:22</span>
								<span className="text-(--secondary)">recruiter_tom</span>
								<span>MOVE_CANDIDATE</span>
							</div>
							<div className="flex justify-between py-2 text-(--body)">
								<span>08:01:55</span>
								<span className="text-(--secondary)">system</span>
								<span>AUTO_REJECT_BATCH</span>
							</div>
						</div>
					</div>
				</div>
			</section>
			<section className="flex min-h-[512px] flex-col items-center justify-center border-t border-(--rule) bg-(--ink) px-4 py-24 text-center">
				<h2 className="font-masthead text-[64px] italic font-black text-(--on-surface) mb-6 leading-none">
					Ready to hire?
				</h2>
				<p className="font-ui-xl text-body text-(--body) mb-12 max-w-2xl">
					Post your first role in under 3 minutes.
				</p>
				<Link
					to="/register"
					className="bg-(--press-amber) text-(--ink) px-12 py-5 font-ui-lg font-bold hover:bg-[#d65a09] transition-colors text-lg tracking-wide border border-(--press-amber) hover:border-[#d65a09]"
				>
					Get Started
				</Link>
			</section>
		</main>
	);
}
