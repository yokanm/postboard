import { Link } from "@tanstack/react-router";

export function PublicFooter() {
	return (
		<footer className="w-full border-t border-(--rule) bg-(--surface-container-lowest)">
			<div className="mx-auto grid max-w-(--max-width) grid-cols-2 gap-(--gutter) px-(--margin) py-(--section-v-pad) md:grid-cols-4">
				<div className="col-span-2 md:col-span-1 flex flex-col gap-4">
					<Link
						to="/"
						className="font-masthead text-[24px] whitespace-nowrap uppercase tracking-tighter text-(--on-surface-variant) leading-none"
					>
						POSTBOARD
					</Link>
					<p className="mono-label mt-8 text-(--dim) uppercase">
						&copy; 2024 POSTBOARD INDUSTRIAL SYSTEMS // ALL RIGHTS RESERVED
					</p>
				</div>
				<div className="flex flex-col gap-2">
					<span className="mono-label mb-2 text-(--dim) uppercase">
						// PRODUCT
					</span>
					<Link
						to="/"
						className="font-ui-sm text-(--dim) hover:text-(--primary) transition-colors"
					>
						Product
					</Link>
					<Link
						to="/features"
						className="font-ui-sm text-(--dim) hover:text-(--primary) transition-colors"
					>
						Features
					</Link>
					<Link
						to="/pricing"
						className="font-ui-sm text-(--dim) hover:text-(--primary) transition-colors"
					>
						Pricing
					</Link>
					<span className="font-ui-sm text-(--dim) opacity-50 cursor-not-allowed">
						API
					</span>
				</div>
				<div className="flex flex-col gap-2">
					<span className="mono-label mb-2 text-(--dim) uppercase">
						// COMPANY
					</span>
					<Link
						to="/about"
						className="font-ui-sm text-(--dim) hover:text-(--primary) transition-colors"
					>
						Company
					</Link>
					<Link
						to="/about"
						className="font-ui-sm text-(--dim) hover:text-(--primary) transition-colors"
					>
						About
					</Link>
					<Link
						to="/about"
						className="font-ui-sm text-(--dim) hover:text-(--primary) transition-colors"
					>
						Careers
					</Link>
					<Link
						to="/contact"
						className="font-ui-sm text-(--dim) hover:text-(--primary) transition-colors"
					>
						Press
					</Link>
				</div>
				<div className="flex flex-col gap-2">
					<span className="mono-label mb-2 text-(--dim) uppercase">
						// LEGAL
					</span>
					<Link
						to="/privacy"
						className="font-ui-sm text-(--dim) hover:text-(--primary) transition-colors"
					>
						Privacy
					</Link>
					<Link
						to="/terms"
						className="font-ui-sm text-(--dim) hover:text-(--primary) transition-colors"
					>
						Terms
					</Link>
					<Link
						to="/contact"
						className="font-ui-sm text-(--dim) hover:text-(--primary) transition-colors"
					>
						Security
					</Link>
				</div>
			</div>
		</footer>
	);
}
