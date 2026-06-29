export function PrivacyPage() {
	return (
		<main className="mx-auto w-full max-w-(--max-width) flex-1">
			<section className="border-b border-(--rule) px-(--margin) pb-(--section-v-pad) pt-24">
				<div className="mx-auto max-w-(--max-width)">
					<div className="mono-label mb-6 flex items-center gap-2 text-(--primary-container) uppercase">
						<span className="text-(--dim)">//</span> legal_notice
					</div>
					<h1 className="font-masthead text-(--on-surface) mb-8 w-full break-words tracking-tighter leading-none md:w-3/4">
						Privacy Policy
					</h1>
					<div className="mt-12 flex flex-col gap-8 border-t border-(--rule) pt-6 text-(--dim) font-mono-label text-mono-label md:flex-row">
						<div>
							<span className="mb-1 block text-(--body)">EFFECTIVE DATE</span>
							<time>OCTOBER 24, 2024</time>
						</div>
						<div>
							<span className="mb-1 block text-(--body)">DOCUMENT ID</span>
							<span>POL-PRIV-2024-V2</span>
						</div>
						<div>
							<span className="mb-1 block text-(--body)">DATA CONTROLLER</span>
							<span>POSTBOARD INDUSTRIAL SYSTEMS</span>
						</div>
					</div>
				</div>
			</section>
			<div className="mx-auto grid max-w-(--max-width) grid-cols-1 gap-(--gutter) px-(--margin) py-(--section-v-pad) md:grid-cols-12">
				<aside className="hidden md:col-span-3 md:block">
					<nav className="sticky top-24 space-y-6 border-l border-(--rule) pl-6">
						<div className="mono-label mb-8 text-(--dim) uppercase tracking-wider">
							// Directory
						</div>
						<ul className="space-y-4 font-ui-sm text-ui-sm">
							<li>
								<a
									href="#information-collection"
									className="block text-(--body) transition-colors hover:text-(--press-amber)"
								>
									01. Information Collection
								</a>
							</li>
							<li>
								<a
									href="#data-usage"
									className="block text-(--body) transition-colors hover:text-(--press-amber)"
								>
									02. Data Usage &amp; Processing
								</a>
							</li>
							<li>
								<a
									href="#cookies"
									className="block text-(--body) transition-colors hover:text-(--press-amber)"
								>
									03. Telemetry &amp; Cookies
								</a>
							</li>
							<li>
								<a
									href="#user-rights"
									className="block text-(--body) transition-colors hover:text-(--press-amber)"
								>
									04. User Rights &amp; Auditing
								</a>
							</li>
						</ul>
					</nav>
				</aside>
				<article className="space-y-(--section-v-pad) text-(--body) font-body text-body leading-relaxed md:col-span-9">
					<p className="text-lg text-(--on-surface)">
						This document establishes the binding privacy architecture for
						PostBoard Industrial Systems. It delineates the mechanisms,
						constraints, and protocols governing the acquisition, processing,
						and retention of telemetry and user-provided data structures within
						our infrastructure.
					</p>
					<section className="scroll-mt-24" id="information-collection">
						<span className="mono-label mb-4 block text-(--dim) uppercase">
							// SECTION_01
						</span>
						<h2 className="font-headline text-headline text-(--on-surface) mb-6 border-b border-(--rule) pb-4">
							Information Collection
						</h2>
						<div className="space-y-6">
							<p>
								We passively and actively ingest specific data vectors to
								maintain operational integrity and provide recruitment pipeline
								services. This intelligence is segregated into two primary
								classifications: volatile session data and persistent
								operational records.
							</p>
							<div className="border border-(--rule) bg-(--surface-container-lowest) p-6">
								<h3 className="font-ui-lg text-ui-lg text-(--on-surface) mb-4">
									Direct Ingestion Vectors
								</h3>
								<ul className="space-y-3 font-mono-label text-mono-label">
									<li className="flex gap-4 border-b border-(--rule) pb-3">
										<span className="w-32 shrink-0 text-(--dim)">
											AUTH_DATA
										</span>
										<span className="text-(--on-surface)">
											Credentials, cryptographic hashes, and identity assertions
											required for system entry.
										</span>
									</li>
									<li className="flex gap-4 border-b border-(--rule) pb-3">
										<span className="w-32 shrink-0 text-(--dim)">
											PROFILE_PAYLOAD
										</span>
										<span className="text-(--on-surface)">
											Structured employment histories, technical competency
											matrices, and contact vectors.
										</span>
									</li>
									<li className="flex gap-4 pt-3">
										<span className="w-32 shrink-0 text-(--dim)">
											BILLING_STATE
										</span>
										<span className="text-(--on-surface)">
											Encrypted financial routing tokens utilized by our
											compliant gateway partners.
										</span>
									</li>
								</ul>
							</div>
						</div>
					</section>
					<section className="scroll-mt-24" id="data-usage">
						<span className="mono-label mb-4 block text-(--dim) uppercase">
							// SECTION_02
						</span>
						<h2 className="font-headline text-headline text-(--on-surface) mb-6 border-b border-(--rule) pb-4">
							Data Usage &amp; Processing
						</h2>
						<div className="space-y-6">
							<p>
								Collected telemetry and structural data are routed through our
								analytical matrices strictly to fulfill our core contractual
								obligations and optimize infrastructure yield. PostBoard does
								not engage in external data syndication or opaque broker
								transactions.
							</p>
							<p>
								Processing environments operate under strict zero-trust
								parameters. Algorithmic matching sequences utilize normalized,
								anonymized metadata arrays to prevent systemic bias while
								maximizing technical fit ratios between organizational entities
								and individual operators.
							</p>
						</div>
					</section>
					<section className="scroll-mt-24" id="cookies">
						<span className="mono-label mb-4 block text-(--dim) uppercase">
							// SECTION_03
						</span>
						<h2 className="font-headline text-headline text-(--on-surface) mb-6 border-b border-(--rule) pb-4">
							Telemetry &amp; Cookies
						</h2>
						<div className="space-y-6">
							<p>
								Our interfaces deploy persistent and volatile localized storage
								constructs (commonly identified as cookies or local storage
								objects) to maintain state across disparate sessions and
								stabilize load-balancing arrays.
							</p>
							<div className="grid grid-cols-1 gap-(--gutter) md:grid-cols-2">
								<div className="border border-(--rule) p-4">
									<div className="mono-label mb-2 text-(--primary-container)">
										ESSENTIAL_STATE
									</div>
									<p className="text-sm">
										Cryptographic session identifiers necessary for sustained
										authorization. Cannot be suppressed.
									</p>
								</div>
								<div className="border border-(--rule) p-4">
									<div className="mono-label mb-2 text-(--dim)">
										ANALYTIC_VECTORS
									</div>
									<p className="text-sm">
										Aggregated performance heuristics. Modifiable via standard
										browser configurations.
									</p>
								</div>
							</div>
						</div>
					</section>
					<section className="scroll-mt-24" id="user-rights">
						<span className="mono-label mb-4 block text-(--dim) uppercase">
							// SECTION_04
						</span>
						<h2 className="font-headline text-headline text-(--on-surface) mb-6 border-b border-(--rule) pb-4">
							User Rights &amp; Auditing
						</h2>
						<div className="space-y-6">
							<p>
								Under modern regulatory frameworks (including GDPR, CCPA, and
								equivalent regional mandates), operators maintain explicit
								authority over their operational records residing within our
								infrastructure.
							</p>
							<ul className="list-none space-y-4 border-l border-(--primary-container) pl-6">
								<li>
									<strong className="font-ui-lg text-ui-lg mb-1 block text-(--on-surface)">
										Right to Extraction
									</strong>
									Operators may request an unencrypted, machine-readable JSON
									dump of their active records via the system terminal settings.
								</li>
								<li>
									<strong className="font-ui-lg text-ui-lg mb-1 block text-(--on-surface)">
										Right to Termination
									</strong>
									Irreversible hard deletion commands can be executed, subject
									to standard 30-day archival propagation delays.
								</li>
							</ul>
						</div>
					</section>
				</article>
			</div>
		</main>
	);
}
