import {
	Building01Icon,
	HeadsetIcon,
	MailIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

export function ContactPage() {
	const [submitted, setSubmitted] = useState(false);

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSubmitted(true);
	}

	return (
		<main className="relative mx-auto w-full max-w-(--max-width) flex-1 px-(--margin) pb-(--section-v-pad) pt-[120px]">
			<div className="pointer-events-none absolute right-0 top-0 z-[-1] h-96 w-1/3 bg-gradient-to-br from-(--press-amber)/10 to-transparent opacity-50 blur-3xl" />
			<section className="relative mb-24">
				<div className="flex flex-col items-end justify-between border-b border-(--rule) pb-8 md:flex-row">
					<div className="max-w-2xl">
						<p className="mono-label mb-4 text-(--dim) uppercase tracking-widest">
							// CONTACT_GATEWAY
						</p>
						<h1 className="font-masthead text-(--on-surface) md:text-masthead leading-none tracking-tighter">
							We'd Love To Hear From You.
						</h1>
					</div>
					<div className="mt-8 text-right md:mt-0">
						<p className="mono-label text-(--dim)">
							SYS_STATUS: <span className="text-(--live)">ONLINE</span>
						</p>
						<p className="mono-label text-(--dim)">RESPONSE_TIME: &lt;24H</p>
					</div>
				</div>
			</section>
			<div className="grid grid-cols-1 gap-(--gutter) md:grid-cols-12">
				<div className="flex flex-col gap-6 md:col-span-4">
					<span className="mono-label mb-2 text-(--dim) uppercase">
						// DIRECT_ROUTING
					</span>
					<a
						href="#form-target"
						className="group block border border-(--rule) bg-(--surface-container) p-6 transition-colors hover:border-(--press-amber)"
					>
						<div className="mb-4 flex items-center justify-between">
							<div className="flex h-10 w-10 items-center justify-center border border-(--rule) bg-(--background) transition-colors group-hover:border-(--press-amber)">
								<span
									className="text-(--dim) transition-colors group-hover:text-(--press-amber)"
									aria-hidden="true"
								>
									<HugeiconsIcon
										icon={MailIcon}
										strokeWidth={2}
										className="h-4 w-4"
									/>
								</span>
							</div>
							<span
								className="text-(--dim) transition-colors group-hover:text-(--press-amber)"
								aria-hidden="true"
							>
								&#8599;
							</span>
						</div>
						<h3 className="font-ui-lg text-ui-lg text-(--on-background) mb-1">
							General Support
						</h3>
						<p className="font-ui-sm text-ui-sm text-(--dim)">
							Account issues, billing, and platform navigation.
						</p>
					</a>
					<a
						href="#form-target"
						className="group block border border-(--rule) bg-(--surface-container) p-6 transition-colors hover:border-(--press-amber)"
					>
						<div className="mb-4 flex items-center justify-between">
							<div className="flex h-10 w-10 items-center justify-center border border-(--rule) bg-(--background) transition-colors group-hover:border-(--press-amber)">
								<span
									className="text-(--dim) transition-colors group-hover:text-(--press-amber)"
									aria-hidden="true"
								>
									<HugeiconsIcon
										icon={HeadsetIcon}
										strokeWidth={2}
										className="h-4 w-4"
									/>
								</span>
							</div>
							<span
								className="text-(--dim) transition-colors group-hover:text-(--press-amber)"
								aria-hidden="true"
							>
								&#8599;
							</span>
						</div>
						<h3 className="font-ui-lg text-ui-lg text-(--on-background) mb-1">
							Recruiter Support
						</h3>
						<p className="font-ui-sm text-ui-sm text-(--dim)">
							Job posting limits, analytics, and enterprise features.
						</p>
					</a>
					<a
						href="#form-target"
						className="group block border border-(--rule) bg-(--surface-container) p-6 transition-colors hover:border-(--press-amber)"
					>
						<div className="mb-4 flex items-center justify-between">
							<div className="flex h-10 w-10 items-center justify-center border border-(--rule) bg-(--background) transition-colors group-hover:border-(--press-amber)">
								<span
									className="text-(--dim) transition-colors group-hover:text-(--press-amber)"
									aria-hidden="true"
								>
									<HugeiconsIcon
										icon={Building01Icon}
										strokeWidth={2}
										className="h-4 w-4"
									/>
								</span>
							</div>
							<span
								className="text-(--dim) transition-colors group-hover:text-(--press-amber)"
								aria-hidden="true"
							>
								&#8599;
							</span>
						</div>
						<h3 className="font-ui-lg text-ui-lg text-(--on-background) mb-1">
							Partnerships
						</h3>
						<p className="font-ui-sm text-ui-sm text-(--dim)">
							API access, integrations, and strategic alliances.
						</p>
					</a>
					<div className="mt-8 border-t border-(--rule) pt-6">
						<span className="mono-label mb-4 block text-(--dim) uppercase">
							// HQ_COORDINATES
						</span>
						<div className="border border-(--rule) bg-(--surface-container) p-4">
							<p className="font-ui-sm text-ui-sm text-(--on-background) font-semibold">
								PostBoard Industrial Systems
							</p>
							<p className="mono-label mt-2 text-(--dim)">
								100 Terminal Way, Floor 4<br />
								San Francisco, CA 94105
								<br />
								UNITED STATES
							</p>
						</div>
					</div>
				</div>
				<div className="mt-12 md:col-span-8 md:mt-0" id="form-target">
					{submitted ? (
						<div className="border border-(--live) bg-(--live-dim)/10 p-8 text-center">
							<span className="mono-label mb-2 block text-(--live) uppercase">
								// TRANSMISSION_SENT
							</span>
							<p className="font-body text-(--body)">
								Thank you for reaching out. We'll respond within 24 hours.
							</p>
						</div>
					) : (
						<div className="relative overflow-hidden border border-(--rule) bg-(--surface-container) p-8">
							<div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-(--press-amber) via-(--gradient-b) to-transparent" />
							<div className="mb-8 flex justify-between border-b border-(--rule) pb-2">
								<span className="mono-label text-(--dim) uppercase">
									// TRANSMISSION_FORM
								</span>
								<span className="mono-label text-(--dim)">REQ_ID: #409-A</span>
							</div>
							<form onSubmit={handleSubmit} className="space-y-8">
								<div>
									<h4 className="mono-label mb-4 text-(--press-amber)">
										// BASICS
									</h4>
									<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
										<div className="space-y-2">
											<label
												htmlFor="full_name"
												className="mono-label block text-(--dim) uppercase"
											>
												Full Name
											</label>
											<input
												id="full_name"
												type="text"
												required
												className="w-full border border-(--rule) bg-(--background) px-4 py-3 font-ui-sm text-ui-sm text-(--on-background) transition-colors placeholder:text-(--surface-variant) focus:border-(--press-amber) focus:outline-none focus:ring-1 focus:ring-(--press-amber)"
												placeholder="Jane Doe"
											/>
										</div>
										<div className="space-y-2">
											<label
												htmlFor="email"
												className="mono-label block text-(--dim) uppercase"
											>
												Email Address
											</label>
											<input
												id="email"
												type="email"
												required
												className="w-full border border-(--rule) bg-(--background) px-4 py-3 font-ui-sm text-ui-sm text-(--on-background) transition-colors placeholder:text-(--surface-variant) focus:border-(--press-amber) focus:outline-none focus:ring-1 focus:ring-(--press-amber)"
												placeholder="jane@company.com"
											/>
										</div>
									</div>
								</div>
								<div className="border-t border-(--rule) pt-6">
									<h4 className="mono-label mb-4 text-(--press-amber)">
										// INQUIRY
									</h4>
									<div className="space-y-6">
										<div className="space-y-2">
											<label
												htmlFor="subject"
												className="mono-label block text-(--dim) uppercase"
											>
												Subject
											</label>
											<select
												id="subject"
												required
												className="w-full appearance-none border border-(--rule) bg-(--background) px-4 py-3 font-ui-sm text-ui-sm text-(--on-background) transition-colors focus:border-(--press-amber) focus:outline-none focus:ring-1 focus:ring-(--press-amber) cursor-pointer"
											>
												<option value="support">General Support</option>
												<option value="recruiter">Recruiter / Billing</option>
												<option value="api">API / Integrations</option>
												<option value="other">Other</option>
											</select>
										</div>
										<div className="space-y-2">
											<label
												htmlFor="message"
												className="mono-label flex justify-between text-(--dim) uppercase"
											>
												<span>Message Payload</span>
												<span className="text-(--surface-variant) font-normal">
													Max 2000 chars
												</span>
											</label>
											<textarea
												id="message"
												required
												rows={6}
												className="w-full resize-y border border-(--rule) bg-(--background) px-4 py-3 font-mono-label text-mono-label text-(--on-background) transition-colors placeholder:text-(--surface-variant) focus:border-(--press-amber) focus:outline-none focus:ring-1 focus:ring-(--press-amber)"
												placeholder="Describe your issue or inquiry in detail..."
											/>
										</div>
									</div>
								</div>
								<div className="flex items-center justify-between border-t border-(--rule) pt-6">
									<p className="mono-label hidden text-(--dim) md:block">
										By transmitting, you agree to our{" "}
										<a
											href="/privacy"
											className="text-(--on-background) underline hover:text-(--press-amber)"
										>
											Privacy Policy
										</a>
										.
									</p>
									<button
										type="submit"
										className="bg-(--press-amber) text-(--on-primary) group flex w-full items-center justify-center gap-2 px-8 py-3 font-mono-label text-mono-label font-bold uppercase transition-colors hover:bg-(--primary-fixed-dim) md:w-auto"
									>
										Transmit Message
										<span
											className="text-[16px] transition-transform group-hover:translate-x-1"
											aria-hidden="true"
										>
											&#8594;
										</span>
									</button>
								</div>
							</form>
						</div>
					)}
				</div>
			</div>
		</main>
	);
}
