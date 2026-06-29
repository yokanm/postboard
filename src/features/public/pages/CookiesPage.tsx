export function CookiesPage() {
	return (
		<main className="mx-auto w-full max-w-(--max-width) flex-1 px-(--margin) py-(--section-v-pad)">
			<section className="mb-(--section-v-pad) border-b border-(--rule) pb-(--section-v-pad)">
				<span className="mono-label mb-4 block text-(--dim) uppercase tracking-widest">
					// COOKIES
				</span>
				<h1 className="font-headline text-(--on-surface) mb-6">
					Cookie Policy
				</h1>
				<p className="font-body text-[13px] text-(--dim) mb-8">
					Last updated: January 2024
				</p>
			</section>

			<div className="max-w-3xl space-y-8">
				<section>
					<h2 className="font-ui-lg text-(--on-surface) mb-3">
						1. What Are Cookies
					</h2>
					<p className="font-body text-(--body) leading-relaxed">
						Cookies are small text files stored on your device by your web
						browser. They help us provide and improve our service by remembering
						your preferences and session information.
					</p>
				</section>

				<section>
					<h2 className="font-ui-lg text-(--on-surface) mb-3">
						2. How We Use Cookies
					</h2>
					<p className="font-body text-(--body) leading-relaxed">
						We use essential cookies for authentication and security, preference
						cookies to remember your settings (such as theme preference), and
						analytics cookies to understand how our platform is used.
					</p>
				</section>

				<section>
					<h2 className="font-ui-lg text-(--on-surface) mb-3">
						3. Managing Cookies
					</h2>
					<p className="font-body text-(--body) leading-relaxed">
						You can control cookies through your browser settings. Disabling
						certain cookies may affect the functionality of the platform.
					</p>
				</section>

				<section>
					<h2 className="font-ui-lg text-(--on-surface) mb-3">
						4. Third-Party Cookies
					</h2>
					<p className="font-body text-(--body) leading-relaxed">
						We do not use third-party tracking cookies. All cookies on Postboard
						are strictly necessary for platform functionality or user
						preferences.
					</p>
				</section>
			</div>
		</main>
	);
}
