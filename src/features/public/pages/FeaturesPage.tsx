import {
	LockIcon,
	ShieldIcon,
	SquareIcon,
	TerminalIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function FeaturesPage() {
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
							// SYSTEM_OVERVIEW
						</span>
					</div>
					<h1 className="font-masthead text-(--on-surface) mb-8">
						Everything You Need To Hire And Get Hired
					</h1>
					<p className="font-ui-xl text-ui-xl text-(--body) max-w-2xl border-l-2 border-(--press-amber) pl-4">
						A high-density, technical pipeline management platform designed for
						elite recruitment. Speed, clarity, and precision built natively into
						every interaction.
					</p>
				</div>
			</section>
			<section className="mx-auto max-w-(--max-width) px-(--margin) py-(--section-v-pad)">
				<div className="mb-8 flex items-end justify-between border-b border-(--rule) pb-4">
					<h2 className="mono-label text-(--on-surface) uppercase tracking-widest">
						// candidate_features
					</h2>
					<span className="mono-label text-(--dim)">05 MODULES ACTIVE</span>
				</div>
				<div className="grid grid-cols-1 border-t border-l border-(--rule) md:grid-cols-2 lg:grid-cols-3">
					{[
						{
							title: "Job Discovery",
							desc: "Advanced querying and filtering capabilities. Cut through the noise and surface highly relevant technical roles instantly.",
						},
						{
							title: "Saved Jobs",
							desc: "Maintain a curated ledger of potential opportunities. Organize targets with customizable tags and urgency indicators.",
						},
						{
							title: "Application Tracking",
							desc: "Real-time pipeline visibility. Monitor status changes, interview schedules, and feedback loops across all active applications.",
						},
						{
							title: "Resume Management",
							desc: "Version control for your professional history. Upload, parse, and deploy targeted resumes for specific role categories.",
						},
						{
							title: "Event Notifications",
							desc: "Granular alert configurations. Receive critical updates via email, SMS, or webhooks for state changes.",
						},
						{ title: "", desc: "" },
					].map((f, i) => (
						<div
							key={f.title || `placeholder-${i}`}
							className={`group relative overflow-hidden border-r border-b border-(--rule) bg-(--surface) p-6 transition-colors hover:bg-(--surface-container-high) ${f.title ? "" : "hidden lg:block opacity-50"}`}
						>
							{f.title ? (
								<>
									<div className="absolute right-0 top-0 p-4 opacity-0 transition-opacity group-hover:opacity-100">
										<span
											className="text-(--press-amber) text-sm"
											aria-hidden="true"
										>
											&#8599;
										</span>
									</div>
									<div
										className="mb-6 text-(--on-surface) transition-colors group-hover:text-(--press-amber)"
										aria-hidden="true"
									>
										<HugeiconsIcon
											icon={SquareIcon}
											strokeWidth={2}
											className="h-8 w-8"
										/>
									</div>
									<h3 className="font-ui-lg text-ui-lg text-(--on-surface) mb-2">
										{f.title}
									</h3>
									<p className="font-body text-body text-(--body)">{f.desc}</p>
								</>
							) : (
								<div
									className="absolute inset-0 opacity-50"
									style={{
										backgroundImage:
											"repeating-linear-gradient(45deg, var(--rule) 0, var(--rule) 1px, transparent 1px, transparent 8px)",
									}}
								/>
							)}
						</div>
					))}
				</div>
			</section>
			<section className="mx-auto max-w-(--max-width) px-(--margin) py-(--section-v-pad)">
				<div className="mb-8 flex items-end justify-between border-b border-(--rule) pb-4">
					<h2 className="mono-label text-(--on-surface) uppercase tracking-widest">
						// recruiter_features
					</h2>
					<span className="mono-label text-(--dim)">06 MODULES ACTIVE</span>
				</div>
				<div className="grid grid-cols-1 border-t border-l border-(--rule) md:grid-cols-2 lg:grid-cols-3">
					{[
						{
							title: "Company Management",
							desc: "Centralized organizational profiles. Manage brand assets, team hierarchies, and billing structures from a single dashboard.",
						},
						{
							title: "Job Posting Engine",
							desc: "Streamlined requisition creation. Syndicate structured job data across multiple technical channels with markdown support.",
						},
						{
							title: "Applicant Pipeline",
							desc: "Drag-and-drop state management. Visualize candidate progression through customizable stages with automated trigger actions.",
						},
						{
							title: "Hiring Workflow",
							desc: "Programmable assessment logic. Define required technical screens, panel interviews, and standard operating procedures per role.",
						},
						{
							title: "Team Collaboration",
							desc: "Asynchronous evaluation protocols. Capture structured feedback, conduct blind reviews, and reach consensus faster.",
						},
						{
							title: "Yield Analytics",
							desc: "Deep telemetry on hiring velocity. Measure time-to-fill, source quality, and bottleneck metrics with exportable reports.",
						},
					].map((f) => (
						<div
							key={f.title}
							className="group border-r border-b border-(--rule) bg-(--surface) p-6 transition-colors hover:bg-(--surface-container-high) border-l-4 border-l-transparent hover:border-l-(--press-amber)"
						>
							<div
								className="mb-6 text-(--on-surface) transition-colors group-hover:text-(--press-amber)"
								aria-hidden="true"
							>
								<HugeiconsIcon
									icon={SquareIcon}
									strokeWidth={2}
									className="h-8 w-8"
								/>
							</div>
							<h3 className="font-ui-lg text-ui-lg text-(--on-surface) mb-2">
								{f.title}
							</h3>
							<p className="font-body text-body text-(--body)">{f.desc}</p>
						</div>
					))}
				</div>
			</section>
			<section className="mx-auto max-w-(--max-width) px-(--margin) py-(--section-v-pad) mb-16">
				<div className="overflow-hidden border border-(--rule) bg-(--surface)">
					<div className="flex items-center justify-between border-b border-(--rule) bg-(--surface-container-high) p-3">
						<div className="flex items-center gap-4">
							<span className="mono-label text-(--on-surface) uppercase tracking-widest">
								// platform_core
							</span>
							<div className="flex gap-2">
								<span className="h-2 w-2 rounded-full bg-(--rule)" />
								<span className="h-2 w-2 rounded-full bg-(--rule)" />
								<span className="h-2 w-2 rounded-full bg-(--rule)" />
							</div>
						</div>
						<span className="mono-label text-(--dim)">
							sys_status: <span className="text-(--live)">operational</span>
						</span>
					</div>
					<div className="grid grid-cols-1 divide-y divide-(--rule) md:grid-cols-2 md:divide-x md:divide-y-0">
						<div className="p-8">
							<div className="mb-6 flex items-center gap-3">
								<span className="text-(--press-amber)" aria-hidden="true">
									<HugeiconsIcon
										icon={ShieldIcon}
										strokeWidth={2}
										className="h-5 w-5"
									/>
								</span>
								<h4 className="mono-label text-(--on-surface) text-lg">
									Secure Auth Infrastructure
								</h4>
							</div>
							<ul className="space-y-4 font-mono-label text-mono-label text-(--body) leading-relaxed">
								{[
									"Enterprise-grade SSO integration (SAML 2.0, OIDC).",
									"Enforced Multi-Factor Authentication (MFA) via WebAuthn or TOTP.",
									"Session anomaly detection and automated termination protocols.",
									"Data encrypted at rest (AES-256) and in transit (TLS 1.3).",
								].map((item) => (
									<li key={item} className="flex items-start gap-2">
										<span className="mt-1 text-(--dim)">&gt;</span>
										<span>{item}</span>
									</li>
								))}
							</ul>
						</div>
						<div className="p-8">
							<div className="mb-6 flex items-center gap-3">
								<span className="text-(--press-amber)" aria-hidden="true">
									<HugeiconsIcon
										icon={LockIcon}
										strokeWidth={2}
										className="h-5 w-5"
									/>
								</span>
								<h4 className="mono-label text-(--on-surface) text-lg">
									Role-Based Access Control
								</h4>
							</div>
							<ul className="space-y-4 font-mono-label text-mono-label text-(--body) leading-relaxed">
								{[
									"Granular permission matrices down to the object level.",
									"Custom role definitions separating Hiring Managers from Recruiters.",
									"Immutable audit logging for all permission escalations and data access.",
									"Automated provisioning via SCIM integration.",
								].map((item) => (
									<li key={item} className="flex items-start gap-2">
										<span className="mt-1 text-(--dim)">&gt;</span>
										<span>{item}</span>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
