export function AboutPage() {
	return (
		<main className="mx-auto w-full max-w-(--max-width) flex-1 px-(--margin)">
			<header className="grid grid-cols-1 items-end gap-(--gutter) border-b border-(--rule) py-(--section-v-pad) lg:grid-cols-12">
				<div className="lg:col-span-8">
					<span className="mono-label mb-4 block text-(--dim) uppercase">
						// POSTBOARD_ORIGINS
					</span>
					<h1 className="font-masthead text-(--on-surface) md:text-[120px] uppercase tracking-tighter leading-[0.9] break-words">
						Connecting
						<br />
						<span className="text-(--press-amber) italic">Talent</span> With
						<br />
						Opportunity
					</h1>
				</div>
				<div className="flex h-full flex-col justify-end border-l border-(--rule) pb-4 pl-(--gutter) lg:col-span-4">
					<p className="font-body text-body text-(--body) max-w-md">
						We are engineering the infrastructure for human capital. A
						high-density pipeline bridging elite technical proficiency with
						rigorous industrial demands. No noise, just signal.
					</p>
					<div className="mt-8 flex gap-4">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="h-8 w-8 border border-(--rule) bg-(--surface-container) press-grid-tile"
							/>
						))}
					</div>
				</div>
			</header>
			<section className="border-b border-(--rule) py-(--section-v-pad)">
				<span className="mono-label mb-8 block text-(--dim) uppercase">
					// CORE_OPERATING_PRINCIPLES
				</span>
				<div className="grid grid-cols-1 border border-(--rule) bg-(--rule) md:grid-cols-3">
					<div className="relative col-span-1 overflow-hidden border-b border-(--rule) bg-(--surface) p-8 md:col-span-2 md:border-b-0 md:border-r group">
						<div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-(--press-amber)/10 blur-3xl transition-all duration-500 group-hover:bg-(--press-amber)/20" />
						<h2 className="font-headline text-headline relative z-10 mb-4">
							Simplifying Hiring
						</h2>
						<p className="font-body text-body text-(--body) relative z-10 max-w-xl">
							The recruitment landscape is cluttered with friction. Our mission
							is to distill the process down to its fundamental components. We
							provide a stark, undeniable conduit between capability and
							requirement, stripping away the superfluous to reveal raw
							potential.
						</p>
					</div>
					<div className="flex flex-col gap-6 bg-(--surface) p-8">
						<div>
							<span className="mono-label mb-1 block text-(--press-amber) uppercase">
								// VALUE_01
							</span>
							<h3 className="font-ui-lg text-ui-lg text-(--on-surface)">
								Transparency
							</h3>
							<p className="font-ui-sm text-ui-sm text-(--body) mt-1">
								Opaque systems breed inefficiency. We surface all variables.
							</p>
						</div>
						<div className="h-px w-full bg-(--rule)" />
						<div>
							<span className="mono-label mb-1 block text-(--press-amber) uppercase">
								// VALUE_02
							</span>
							<h3 className="font-ui-lg text-ui-lg text-(--on-surface)">
								Accessibility
							</h3>
							<p className="font-ui-sm text-ui-sm text-(--body) mt-1">
								Opportunity must be ubiquitous, not gated by antiquated
								networks.
							</p>
						</div>
						<div className="h-px w-full bg-(--rule)" />
						<div>
							<span className="mono-label mb-1 block text-(--press-amber) uppercase">
								// VALUE_03
							</span>
							<h3 className="font-ui-lg text-ui-lg text-(--on-surface)">
								Innovation
							</h3>
							<p className="font-ui-sm text-ui-sm text-(--body) mt-1">
								Continuous iteration on the mechanics of connection.
							</p>
						</div>
					</div>
				</div>
			</section>
			<section className="border-b border-(--rule) py-(--section-v-pad)">
				<span className="mono-label mb-8 block text-(--dim) uppercase">
					// CHRONOLOGY
				</span>
				<div className="relative ml-4 border-l border-(--rule) md:ml-(--margin)">
					<div className="relative mb-12 pl-8">
						<div className="absolute -left-[6px] top-1.5 h-3 w-3 bg-(--press-amber)" />
						<span className="mono-label mb-2 block text-(--dim)">
							Q1 2023 // INCEPTION
						</span>
						<h3 className="font-ui-xl text-ui-xl mb-2">The Idea</h3>
						<p className="font-body text-body text-(--body) max-w-2xl">
							Recognizing the critical failure points in traditional job boards,
							the initial architecture for PostBoard was drafted. A focus on
							high-fidelity data and minimal UI noise was established as the
							baseline.
						</p>
					</div>
					<div className="relative mb-12 pl-8">
						<div className="absolute -left-[6px] top-1.5 h-3 w-3 border border-(--rule) bg-(--surface)" />
						<span className="mono-label mb-2 block text-(--dim)">
							Q4 2023 // DEPLOYMENT
						</span>
						<h3 className="font-ui-xl text-ui-xl mb-2">Beta Launch</h3>
						<p className="font-body text-body text-(--body) max-w-2xl">
							Initial deployment to a closed cohort of 50 enterprise partners.
							The system processed over 10,000 matches with a 40% increase in
							signal-to-noise ratio compared to legacy platforms.
						</p>
					</div>
					<div className="relative pl-8">
						<div className="absolute -left-[6px] top-1.5 h-3 w-3 border border-(--rule) bg-(--surface)" />
						<span className="mono-label mb-2 block text-(--press-amber)">
							CURRENT // VISION
						</span>
						<h3 className="font-ui-xl text-ui-xl mb-2">Scaling the Pipeline</h3>
						<p className="font-body text-body text-(--body) max-w-2xl">
							Expanding the infrastructure to support global technical talent
							markets. Integrating advanced filtering algorithms while
							maintaining absolute adherence to our brutalist, content-first
							design philosophy.
						</p>
					</div>
				</div>
			</section>
			<section className="py-(--section-v-pad)">
				<span className="mono-label mb-8 block text-(--dim) uppercase">
					// SYSTEM_ARCHITECTS
				</span>
				<div className="grid grid-cols-1 gap-(--gutter) md:grid-cols-2 lg:grid-cols-4">
					{[
						{ name: "Alex Mercer", role: "CHIEF_EXECUTIVE" },
						{ name: "Sarah Chen", role: "HEAD_OF_ENGINEERING" },
						{ name: "Marcus Vance", role: "PRODUCT_DIRECTOR" },
						{ name: "Elena Rostova", role: "DATA_ARCHITECT" },
					].map((member) => (
						<div
							key={member.name}
							className="group flex flex-col border border-(--rule) bg-(--surface) transition-colors hover:border-(--press-amber)"
						>
							<div className="relative aspect-square overflow-hidden border-b border-(--rule) bg-(--surface-container-high)">
								<div className="flex h-full w-full items-center justify-center bg-(--surface-container-high) text-(--dim) font-mono-label text-xs">
									PHOTO_PLACEHOLDER
								</div>
							</div>
							<div className="p-4">
								<h4 className="font-ui-lg text-ui-lg text-(--on-surface)">
									{member.name}
								</h4>
								<span className="mono-label mt-1 block text-(--press-amber)">
									{member.role}
								</span>
							</div>
						</div>
					))}
				</div>
			</section>
		</main>
	);
}
