export function AuthBrandPanel() {
	return (
		<div className="relative z-10 flex h-full flex-col justify-between px-8 py-8 pointer-events-auto">
			<div>
				<span className="mono-label block text-(--primary-container)">
					// SYSTEM_AUTH_V4.0
				</span>
			</div>

			<div className="flex flex-1 flex-col items-center justify-center text-center">
				<h1 className="font-masthead m-0 text-(--on-surface)">POSTBOARD</h1>
				<p className="font-headline m-0 italic text-(--primary)">
					Work, printed daily.
				</p>
				<div className="mt-12 flex justify-center gap-1.5" aria-hidden="true">
					<span className="block h-1 w-6 bg-(--press-amber)" />
					<span className="block h-1 w-6 bg-(--gradient-a)" />
					<span className="block h-1 w-6 bg-(--gradient-b)" />
				</div>
			</div>

			<div className="flex flex-col gap-6">
				<div className="whitespace-pre-line">
					<span className="mono-label text-(--dim)">
						ESTABLISHED 2024. INDUSTRIAL RECRUITMENT PIPELINE ARCHITECTURE.
					</span>
				</div>
				<div className="flex items-center gap-2">
					<span className="inline-block h-2 w-2 shrink-0 rounded-full bg-(--live)" />
					<span className="mono-label uppercase tracking-widest text-(--on-surface-variant)">
						ENCRYPTED_SESSION_ACTIVE
					</span>
				</div>
			</div>
		</div>
	);
}
