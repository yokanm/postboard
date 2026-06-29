import { LockIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";

interface AccessRestrictedProps {
	title?: string;
	message?: string;
	dashboardLabel?: string;
	dashboardTo?: string;
	contactLabel?: string;
	contactTo?: string;
}

export function AccessRestricted({
	title = "Access Restricted",
	message = "System logs indicate you do not possess the requisite clearance matrix to view this directory. All access attempts are recorded.",
	dashboardLabel = "Return to Dashboard",
	dashboardTo = "/",
	contactLabel = "Contact Administrator",
	contactTo = "/contact",
}: AccessRestrictedProps) {
	return (
		<div className="press-grid-bg relative flex min-h-[calc(100dvh-64px)] items-center justify-center bg-(--background) p-(--gutter)">
			<div className="relative z-10 flex w-full max-w-2xl flex-col items-center border border-(--rule) bg-(--surface) p-8 text-center md:p-12 shadow-[16px_16px_0px_0px_rgba(26,26,26,1)]">
				<div className="relative mb-8 flex h-24 w-24 items-center justify-center border border-(--rule) bg-(--background) overflow-hidden group">
					<div className="absolute inset-0 bg-(--primary)/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
					<HugeiconsIcon
						icon={LockIcon}
						strokeWidth={2}
						className="h-10 w-10 text-(--primary)"
					/>
				</div>
				<div className="mb-4 inline-block border border-(--primary)/30 bg-(--primary)/5 px-3 py-1 font-mono-label text-mono-label uppercase tracking-[0.2em] text-(--primary)">
					// ERR_403_FORBIDDEN
				</div>
				<h2 className="font-headline text-headline-2xl mb-6 uppercase tracking-tight text-(--on-surface)">
					{title}
				</h2>
				<p className="mb-10 max-w-md border-l-2 border-(--rule) pl-4 text-left font-body-base text-body-base text-(--body)">
					{message}
				</p>
				<div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
					<Link
						to={dashboardTo}
						className="border border-(--primary-container) bg-(--primary-container) px-8 py-4 font-mono-label text-mono-label uppercase tracking-widest text-(--on-primary-container) transition-colors hover:border-(--primary) hover:bg-(--primary)"
					>
						{dashboardLabel}
					</Link>
					<Link
						to={contactTo}
						className="border border-(--rule) bg-transparent px-8 py-4 font-mono-label text-mono-label uppercase tracking-widest text-(--on-surface) transition-colors hover:border-(--dim) hover:bg-(--surface-container-high)"
					>
						{contactLabel}
					</Link>
				</div>
			</div>
			<div className="absolute bottom-8 left-8 hidden font-mono-label text-mono-label uppercase tracking-widest text-(--dim) lg:block">
				SYS.STAT: <span className="text-(--error)">LOCKED</span> <br />
				TERM.ID: 0x4B2A
			</div>
		</div>
	);
}
