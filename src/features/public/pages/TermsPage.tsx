export function TermsPage() {
	return (
		<main className="mx-auto w-full max-w-(--max-width) flex-1 grid grid-cols-1 gap-(--gutter) px-(--margin) pb-(--section-v-pad) pt-[120px] md:grid-cols-12">
			<div className="col-span-1 mb-12 md:col-span-12">
				<h1 className="font-masthead text-(--on-surface) mb-4">
					Terms of Service
				</h1>
				<p className="mono-label text-(--dim) uppercase">
					// EFFECTIVE_DATE: OCTOBER 24, 2024
				</p>
			</div>
			<aside className="col-span-1 hidden md:col-span-3 md:block">
				<div className="sticky top-[120px] border border-(--rule) bg-(--surface) p-6">
					<h2 className="mono-label mb-6 text-(--dim) uppercase">
						// DOCUMENT_INDEX
					</h2>
					<nav className="flex flex-col gap-4 font-ui-sm text-ui-sm">
						<a
							href="#user-accounts"
							className="toc-link border-l-2 border-transparent pl-3 text-(--body) transition-colors hover:text-(--on-surface)"
						>
							User Accounts
						</a>
						<a
							href="#recruiter-responsibilities"
							className="toc-link border-l-2 border-transparent pl-3 text-(--body) transition-colors hover:text-(--on-surface)"
						>
							Recruiter Responsibilities
						</a>
						<a
							href="#candidate-responsibilities"
							className="toc-link border-l-2 border-transparent pl-3 text-(--body) transition-colors hover:text-(--on-surface)"
						>
							Candidate Responsibilities
						</a>
						<a
							href="#content-policies"
							className="toc-link border-l-2 border-transparent pl-3 text-(--body) transition-colors hover:text-(--on-surface)"
						>
							Content Policies
						</a>
						<a
							href="#liability"
							className="toc-link border-l-2 border-transparent pl-3 text-(--body) transition-colors hover:text-(--on-surface)"
						>
							Liability &amp; Disclaimers
						</a>
					</nav>
				</div>
			</aside>
			<article className="col-span-1 border border-(--rule) bg-(--surface) p-8 md:col-span-9 md:p-12">
				<section className="mb-16 scroll-mt-[120px]" id="user-accounts">
					<h3 className="font-headline text-headline text-(--on-surface) mb-6 border-b border-(--rule) pb-4">
						1. User Accounts
					</h3>
					<div className="space-y-4 text-(--body)">
						<p>
							To access certain features of the PostBoard platform, you must
							register for an account. You agree to provide accurate, current,
							and complete information during the registration process and to
							update such information to keep it accurate, current, and
							complete.
						</p>
						<p>
							You are responsible for safeguarding your password. You agree that
							you will not disclose your password to any third party and that
							you will take sole responsibility for any activities or actions
							under your account, whether or not you have authorized such
							activities or actions.
						</p>
						<div className="mt-6 border border-(--rule) bg-(--background) p-4">
							<p className="mono-label mb-2 text-(--dim) uppercase">
								// ACCOUNT_SECURITY_REQUIREMENT
							</p>
							<p className="font-ui-sm text-ui-sm">
								Users utilizing single sign-on (SSO) via enterprise identity
								providers remain fully bound by these security stipulations
								regardless of external authentication mechanisms.
							</p>
						</div>
					</div>
				</section>
				<section
					className="mb-16 scroll-mt-[120px]"
					id="recruiter-responsibilities"
				>
					<h3 className="font-headline text-headline text-(--on-surface) mb-6 border-b border-(--rule) pb-4">
						2. Recruiter Responsibilities
					</h3>
					<div className="space-y-4 text-(--body)">
						<p>
							Entities and individuals utilizing PostBoard to solicit candidates
							("Recruiters") must adhere to strict guidelines concerning the
							representation of roles, compensation, and company culture.
						</p>
						<ul className="list-none space-y-3 border-l border-(--rule) pl-4">
							<li className="relative before:absolute before:left-[-17px] before:top-2 before:h-[1px] before:w-2 before:bg-(--rule)">
								All job postings must reflect bona fide, currently available
								positions.
							</li>
							<li className="relative before:absolute before:left-[-17px] before:top-2 before:h-[1px] before:w-2 before:bg-(--rule)">
								Compensation ranges must be accurate and comply with applicable
								local pay transparency laws.
							</li>
							<li className="relative before:absolute before:left-[-17px] before:top-2 before:h-[1px] before:w-2 before:bg-(--rule)">
								Bait-and-switch tactics or misclassification of employment types
								(e.g., listing a 1099 contract as a W-2 salaried role) will
								result in immediate account termination.
							</li>
						</ul>
					</div>
				</section>
				<section
					className="mb-16 scroll-mt-[120px]"
					id="candidate-responsibilities"
				>
					<h3 className="font-headline text-headline text-(--on-surface) mb-6 border-b border-(--rule) pb-4">
						3. Candidate Responsibilities
					</h3>
					<div className="space-y-4 text-(--body)">
						<p>
							Individuals seeking employment ("Candidates") agree to present
							their qualifications, work history, and identity truthfully.
						</p>
						<p>
							PostBoard relies on the integrity of its candidate pool.
							Fabrication of experience, use of automated bots to apply en
							masse, or harassment of recruiters violates these Terms.
						</p>
					</div>
				</section>
				<section className="mb-16 scroll-mt-[120px]" id="content-policies">
					<h3 className="font-headline text-headline text-(--on-surface) mb-6 border-b border-(--rule) pb-4">
						4. Content Policies
					</h3>
					<div className="space-y-4 text-(--body)">
						<p>
							We reserve the right to remove any content (including job
							postings, company profiles, or candidate resumes) that violates
							our policies or is deemed harmful to the platform ecosystem.
						</p>
						<p>Prohibited content includes, but is not limited to:</p>
						<ul className="list-none space-y-3 border-l border-(--rule) pl-4">
							<li className="relative before:absolute before:left-[-17px] before:top-2 before:h-[1px] before:w-2 before:bg-(--rule)">
								Discriminatory language or requirements not related to bona fide
								occupational qualifications.
							</li>
							<li className="relative before:absolute before:left-[-17px] before:top-2 before:h-[1px] before:w-2 before:bg-(--rule)">
								Malware, phishing links, or requests for sensitive personal
								financial information prior to official hiring processes.
							</li>
							<li className="relative before:absolute before:left-[-17px] before:top-2 before:h-[1px] before:w-2 before:bg-(--rule)">
								Intellectual property infringement.
							</li>
						</ul>
					</div>
				</section>
				<section className="scroll-mt-[120px]" id="liability">
					<h3 className="font-headline text-headline text-(--on-surface) mb-6 border-b border-(--rule) pb-4">
						5. Liability &amp; Disclaimers
					</h3>
					<div className="space-y-4 text-(--body)">
						<p>
							PostBoard is an infrastructure provider connecting talent and
							organizations. We do not guarantee employment, nor do we guarantee
							the quality, safety, or legality of the jobs posted or the
							candidates applying.
						</p>
						<p className="font-ui-sm text-ui-sm tracking-wide text-(--dim) uppercase">
							THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
							WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT
							NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR
							A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
						</p>
					</div>
				</section>
			</article>
		</main>
	);
}
