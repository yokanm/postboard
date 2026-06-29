import {
	Building01Icon,
	FilterHorizontalIcon,
	Location01Icon,
	SearchIcon,
	SortingAZIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import type { MockCompany } from "@/features/public/data/mock-companies";
import { MOCK_COMPANIES } from "@/features/public/data/mock-companies";
import { VerificationBadge } from "@/shared/components/ux/VerificationBadge";

export function CompaniesPage() {
	const [searchQuery, setSearchQuery] = useState("");

	const filtered = MOCK_COMPANIES.filter(
		(c: MockCompany) =>
			c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			c.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
			c.hq.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<main className="mx-auto flex w-full max-w-(--max-width) flex-1 flex-col px-(--margin) pb-24 pt-(--section-v-pad) md:pb-12">
			<section className="mb-(--section-v-pad) border-b border-(--rule) pb-12">
				<span className="mono-label mb-4 block uppercase text-(--dim)">
					// companies_directory
				</span>
				<h1 className="mb-8 font-headline text-(--on-surface) md:font-masthead md:text-[clamp(60px,8vw,96px)]">
					Discover Verified Employers
				</h1>

				<div className="relative mt-12 max-w-2xl">
					<label
						className="mono-label mb-2 block uppercase text-(--dim)"
						htmlFor="company-search"
					>
						// DIRECTORY_QUERY
					</label>
					<div className="relative flex items-center">
						<HugeiconsIcon
							icon={SearchIcon}
							className="absolute left-4 text-(--dim)"
							strokeWidth={2}
						/>
						<input
							id="company-search"
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="SEARCH BY NAME, INDUSTRY, OR KEYWORD..."
							className="w-full border border-(--rule) bg-[#080808] py-4 pl-12 pr-4 font-mono text-[11px] uppercase text-(--on-surface) placeholder-(--dim) transition-colors focus:border-(--primary-container) focus:outline-none"
						/>
						<button
							type="button"
							className="absolute right-0 top-0 bottom-0 border-l border-(--rule) bg-(--primary-container) px-6 font-mono text-[11px] uppercase text-[#080808] transition-colors hover:bg-(--primary)"
						>
							EXECUTE
						</button>
					</div>
				</div>
			</section>

			<div className="mb-8 flex items-center justify-between border-b border-(--rule) pb-4">
				<div className="mono-label text-(--dim)">
					// RESULTS_FOUND: {String(filtered.length).padStart(3, "0")}
				</div>
				<div className="flex gap-4">
					<button
						type="button"
						className="mono-label flex items-center gap-1 text-(--dim) transition-colors hover:text-(--on-surface)"
					>
						<HugeiconsIcon
							icon={FilterHorizontalIcon}
							strokeWidth={2}
							className="h-4 w-4"
						/>
						FILTER
					</button>
					<button
						type="button"
						className="mono-label flex items-center gap-1 text-(--dim) transition-colors hover:text-(--on-surface)"
					>
						<HugeiconsIcon
							icon={SortingAZIcon}
							strokeWidth={2}
							className="h-4 w-4"
						/>
						SORT
					</button>
				</div>
			</div>

			<section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{filtered.map((company: MockCompany) => (
					<Link
						key={company.id}
						to="/companies/$companyId"
						params={{ companyId: company.id }}
						className="group flex h-full cursor-pointer flex-col border border-(--rule) bg-[#0F0F0F] p-6 transition-colors duration-200 hover:border-(--primary-container)"
					>
						<div className="mb-6 flex items-start justify-between">
							<div className="flex h-16 w-16 items-center justify-center border border-(--rule) bg-[#1A1A1A] p-2">
								{company.logoUrl ? (
									<img
										src={company.logoUrl}
										alt={company.name}
										className="h-full w-full object-contain opacity-80 mix-blend-screen transition-opacity group-hover:opacity-100"
									/>
								) : (
									<HugeiconsIcon
										icon={Building01Icon}
										strokeWidth={1.5}
										className="h-8 w-8 text-(--dim)"
									/>
								)}
							</div>
							<div className="flex flex-col items-end gap-1.5">
								{company.isHiring && (
									<span className="mono-label border border-(--primary-container) px-2 py-1 text-(--primary-container)">
										HIRING
									</span>
								)}
								<VerificationBadge
									status={company.verificationStatus}
									size="sm"
								/>
							</div>
						</div>

						<div className="mb-auto">
							<h2 className="mb-2 text-(--on-surface) font-ui-xl">
								{company.name}
							</h2>
							<div className="mono-label mb-4 text-(--dim)">
								// {company.industry}
							</div>
							<p className="mb-6 line-clamp-3 font-body text-[15px] leading-relaxed text-(--body)">
								{company.description}
							</p>
						</div>

						<div className="mt-auto grid grid-cols-2 gap-x-2 gap-y-4 border-t border-(--rule) pt-4">
							<div>
								<div className="mono-label mb-1 text-(--dim)">// HEADCOUNT</div>
								<div className="text-(--on-surface) font-ui-sm">
									{company.headcount}
								</div>
							</div>
							<div>
								<div className="mono-label mb-1 text-(--dim)">// OPEN_REQS</div>
								<div className="text-(--on-surface) font-ui-sm">
									{company.openPositions} POSITIONS
								</div>
							</div>
							<div className="col-span-2">
								<div className="mono-label mb-1 text-(--dim)">// HQ</div>
								<div className="flex items-center gap-1 text-(--on-surface) font-ui-sm">
									<HugeiconsIcon
										icon={Location01Icon}
										strokeWidth={2}
										className="h-3.5 w-3.5 text-(--dim)"
									/>
									{company.hq}
								</div>
							</div>
						</div>
					</Link>
				))}
			</section>

			<div className="mt-12 flex items-center justify-center gap-4 border-t border-(--rule) pt-8">
				<button
					type="button"
					className="mono-label uppercase text-(--dim) transition-colors hover:text-(--on-surface)"
					disabled
				>
					&lt; PREV
				</button>
				<div className="flex gap-2">
					<button
						type="button"
						className="flex h-8 w-8 items-center justify-center border border-(--primary-container) bg-[#080808] text-(--primary-container)"
					>
						1
					</button>
					<button
						type="button"
						className="flex h-8 w-8 items-center justify-center border border-(--rule) bg-[#080808] text-(--dim) transition-colors hover:border-(--primary-container) hover:text-(--on-surface)"
					>
						2
					</button>
					<button
						type="button"
						className="flex h-8 w-8 items-center justify-center border border-(--rule) bg-[#080808] text-(--dim) transition-colors hover:border-(--primary-container) hover:text-(--on-surface)"
					>
						3
					</button>
					<span className="flex h-8 w-8 items-center justify-center text-(--dim)">
						...
					</span>
				</div>
				<button
					type="button"
					className="mono-label uppercase text-(--on-surface) transition-colors hover:text-(--primary-container)"
				>
					NEXT &gt;
				</button>
			</div>
		</main>
	);
}
