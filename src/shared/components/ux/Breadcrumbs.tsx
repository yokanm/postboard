import { Link, useLocation } from "@tanstack/react-router";
import { Fragment } from "react";

interface BreadcrumbItem {
	label: string;
	to?: string;
}

const breadcrumbConfig: Record<string, BreadcrumbItem[]> = {
	"/about": [{ label: "Home", to: "/" }, { label: "About" }],
	"/features": [{ label: "Home", to: "/" }, { label: "Features" }],
	"/contact": [{ label: "Home", to: "/" }, { label: "Contact" }],
	"/privacy": [{ label: "Home", to: "/" }, { label: "Privacy" }],
	"/terms": [{ label: "Home", to: "/" }, { label: "Terms" }],
	"/cookies": [{ label: "Home", to: "/" }, { label: "Cookies" }],
	"/pricing": [{ label: "Home", to: "/" }, { label: "Pricing" }],
	"/companies": [{ label: "Home", to: "/" }, { label: "Companies" }],
	"/jobs": [{ label: "Home", to: "/" }, { label: "Jobs" }],
};

const prefixPatterns: [RegExp, BreadcrumbItem[]][] = [
	[
		/^\/jobs\//,
		[
			{ label: "Home", to: "/" },
			{ label: "Jobs", to: "/jobs" },
			{ label: "Detail" },
		],
	],
	[
		/^\/companies\//,
		[
			{ label: "Home", to: "/" },
			{ label: "Companies", to: "/companies" },
			{ label: "Profile" },
		],
	],
];

function BreadcrumbList({ crumbs }: { crumbs: BreadcrumbItem[] }) {
	if (crumbs.length <= 1) {
		return null;
	}

	return (
		<ol className="flex items-center gap-2">
			{crumbs.map((crumb, index) => (
				<Fragment key={crumb.label}>
					{index > 0 && (
						<span
							className="mono-label text-(--dim) text-[11px]"
							aria-hidden="true"
						>
							/
						</span>
					)}
					<li>
						{crumb.to ? (
							<Link
								to={crumb.to}
								className="mono-label text-[11px] text-(--dim) transition-colors duration-150 hover:text-(--press-amber)"
							>
								{crumb.label}
							</Link>
						) : (
							<span
								className="mono-label text-[11px] text-(--primary)"
								aria-current="page"
							>
								{crumb.label}
							</span>
						)}
					</li>
				</Fragment>
			))}
		</ol>
	);
}

export function Breadcrumbs() {
	const location = useLocation();

	const crumbs =
		breadcrumbConfig[location.pathname] ??
		prefixPatterns.find(([pattern]) => pattern.test(location.pathname))?.[1];

	if (!crumbs || crumbs.length <= 1) {
		return null;
	}

	return (
		<nav aria-label="Breadcrumb">
			<div className="mx-auto flex w-full max-w-(--max-width) items-center gap-2 px-(--margin) pt-4">
				<BreadcrumbList crumbs={crumbs} />
			</div>
		</nav>
	);
}
