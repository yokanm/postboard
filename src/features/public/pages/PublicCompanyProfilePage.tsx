import {
	ArrowRight01Icon,
	Building01Icon,
	Clock01Icon,
	Location01Icon,
	PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import {
	getMockCompanyById,
	type MockCompany,
} from "@/features/public/data/mock-companies";
import { VerificationBadge } from "@/shared/components/ux/VerificationBadge";

const MOCK_JOB_OPENINGS = [
	{
		id: "j1",
		code: "ENG_SR_01",
		title: "Senior Rust Engineer",
		location: "New York, NY",
		schedule: "Full-time",
		salary: "$180k–$250k",
	},
	{
		id: "j2",
		code: "ENG_SR_02",
		title: "Distributed Systems Architect",
		location: "Remote (US)",
		schedule: "Full-time",
		salary: "$200k–$280k",
	},
	{
		id: "j3",
		code: "INF_ML_01",
		title: "ML Infrastructure Lead",
		location: "New York, NY",
		schedule: "Full-time",
		salary: "$190k–$260k",
	},
];

export function PublicCompanyProfilePage({ companyId }: { companyId: string }) {
	const company = getMockCompanyById(companyId);

	const [showAllJobs, setShowAllJobs] = useState(false);
	const displayJobs = showAllJobs
		? MOCK_JOB_OPENINGS
		: MOCK_JOB_OPENINGS.slice(0, 3);

	if (!company) {
		return (
			<main className="mx-auto flex w-full max-w-(--max-width) flex-1 flex-col items-center justify-center px-(--margin) py-24">
				<HugeiconsIcon
					icon={Building01Icon}
					strokeWidth={1.5}
					className="h-12 w-12 text-(--muted)"
				/>
				<h1 className="mt-4 font-headline text-2xl text-(--on-surface)">
					Company Not Found
				</h1>
				<p className="mt-2 text-(--body)">
					The company you are looking for does not exist.
				</p>
			</main>
		);
	}

	return (
		<main className="mx-auto flex w-full max-w-(--max-width) flex-1 flex-col px-(--margin) pb-24 pt-(--section-v-pad)">
			<HeroSection company={company} />
			<div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-12">
				<div className="md:col-span-8">
					<AboutSection company={company} />
					<OpenRolesSection
						jobs={displayJobs}
						showAllJobs={showAllJobs}
						onToggle={() => setShowAllJobs(!showAllJobs)}
						totalCount={MOCK_JOB_OPENINGS.length}
					/>
				</div>
				<aside className="md:col-span-4">
					<ActionCard company={company} />
					<CultureMetrics company={company} />
					<TechStackSection company={company} />
					<LeadershipSection company={company} />
				</aside>
			</div>
		</main>
	);
}

function HeroSection({ company }: { company: MockCompany }) {
	return (
		<section>
			<span className="mono-label mb-4 block uppercase text-(--dim)">
				// company_profile
			</span>
			<div className="flex items-start gap-6">
				<div className="flex h-16 w-16 shrink-0 items-center justify-center border border-(--rule) bg-(--surface-container-low)">
					{company.logoUrl ? (
						<img
							src={company.logoUrl}
							alt={`${company.name} logo`}
							className="h-full w-full object-contain grayscale brightness-75"
						/>
					) : (
						<HugeiconsIcon
							icon={Building01Icon}
							strokeWidth={1.5}
							className="h-8 w-8 text-(--dim)"
						/>
					)}
				</div>
				<div className="flex-1">
					<div className="mb-2 flex flex-wrap items-center gap-3">
						<h1 className="m-0 font-headline text-[24px] text-(--on-surface) sm:text-[32px]">
							{company.name}
						</h1>
						<VerificationBadge status={company.verificationStatus} />
					</div>
					<div className="flex flex-wrap items-center gap-1.5">
						<span className="mono-label border border-(--rule) px-2 py-0.5 text-[10px] uppercase tracking-[0.05em] text-(--dim)">
							{company.industry.replace(/_/g, " ")}
						</span>
						<span className="mono-label border border-(--rule) px-2 py-0.5 text-[10px] uppercase tracking-[0.05em] text-(--dim)">
							{company.headcount} employees
						</span>
					</div>
				</div>
			</div>
		</section>
	);
}

function AboutSection({ company }: { company: MockCompany }) {
	return (
		<section className="mb-12">
			<span className="mono-label mb-4 block text-(--primary-container) uppercase tracking-[0.2em]">
				// about_us
			</span>
			<p className="font-sans text-[15px] leading-relaxed text-(--body)">
				{company.about}
			</p>
			<div className="mt-6 flex h-64 items-center justify-center border border-(--rule) bg-(--surface-container-low)">
				<span className="font-sans text-[13px] text-(--muted)">
					Company hero image
				</span>
			</div>
		</section>
	);
}

function OpenRolesSection({
	jobs,
	showAllJobs,
	onToggle,
	totalCount,
}: {
	jobs: typeof MOCK_JOB_OPENINGS;
	showAllJobs: boolean;
	onToggle: () => void;
	totalCount: number;
}) {
	return (
		<section>
			<span className="mono-label mb-4 block text-(--primary-container) uppercase tracking-[0.2em]">
				// open_roles
			</span>
			<div className="mb-4 flex flex-wrap gap-2">
				<button
					type="button"
					className="mono-label border border-(--primary-container) px-3 py-1 text-[11px] uppercase text-(--primary-container) transition-colors hover:bg-(--primary-container)/10"
				>
					ALL ROLES
				</button>
				<button
					type="button"
					className="mono-label border border-(--rule) px-3 py-1 text-[11px] uppercase text-(--dim) transition-colors hover:border-(--primary-container) hover:text-(--on-surface)"
				>
					ENGINEERING
				</button>
				<button
					type="button"
					className="mono-label border border-(--rule) px-3 py-1 text-[11px] uppercase text-(--dim) transition-colors hover:border-(--primary-container) hover:text-(--on-surface)"
				>
					INFRASTRUCTURE
				</button>
			</div>
			<div className="flex flex-col gap-2">
				{jobs.map((job) => (
					<div
						key={job.id}
						className="group flex cursor-pointer items-center justify-between border border-(--rule) bg-(--surface-container-lowest) p-6 transition-colors hover:bg-(--surface-container)"
					>
						<div className="space-y-1">
							<span className="mono-label text-[10px] uppercase text-(--dim)">
								{job.code}
							</span>
							<h3 className="font-sans text-[16px] font-bold text-(--on-surface) transition-colors group-hover:text-(--primary)">
								{job.title}
							</h3>
							<div className="flex gap-4">
								<span className="mono-label flex items-center gap-1 text-[10px] text-(--dim)">
									<HugeiconsIcon
										icon={Location01Icon}
										strokeWidth={2}
										className="h-3 w-3"
										aria-hidden="true"
									/>
									{job.location}
								</span>
								<span className="mono-label flex items-center gap-1 text-[10px] text-(--dim)">
									<HugeiconsIcon
										icon={Clock01Icon}
										strokeWidth={2}
										className="h-3 w-3"
										aria-hidden="true"
									/>
									{job.schedule}
								</span>
							</div>
						</div>
						<div className="flex flex-col items-end gap-2">
							<span className="mono-label border border-(--rule) px-2 py-1 text-[10px] text-(--dim)">
								{job.salary}
							</span>
							<HugeiconsIcon
								icon={ArrowRight01Icon}
								strokeWidth={2}
								className="h-4 w-4 text-(--dim) transition-transform group-hover:translate-x-1 group-hover:text-(--primary)"
								aria-hidden="true"
							/>
						</div>
					</div>
				))}
			</div>
			{totalCount > 3 && (
				<button
					type="button"
					onClick={onToggle}
					className="mt-2 w-full border border-dashed border-(--rule) px-4 py-3 font-sans text-[12px] text-(--body) transition-colors hover:text-(--on-surface)"
				>
					{showAllJobs ? `SHOW LESS` : `VIEW ALL (${totalCount} ROLES)`}
				</button>
			)}
			{totalCount === 0 && (
				<div className="border border-(--rule) px-6 py-12 text-center">
					<p className="font-sans text-[14px] text-(--dim)">
						No open roles at this time.
					</p>
				</div>
			)}
		</section>
	);
}

function ActionCard({ company }: { company: MockCompany }) {
	return (
		<div className="mb-6 border border-(--rule) bg-(--surface-container-low) p-6">
			<h4 className="font-sans text-[12px] font-semibold uppercase tracking-[0.05em] text-(--body)">
				JOIN THE NETWORK
			</h4>
			<p className="mb-4 font-sans text-[13px] text-(--dim)">
				Connect with {company.name} to stay updated on new opportunities and
				company news.
			</p>
			<button
				type="button"
				className="flex w-full items-center justify-center gap-2 border border-(--rule) bg-(--surface-container-lowest) px-4 py-2 font-mono text-[11px] uppercase tracking-[0.05em] text-(--on-surface) transition-colors hover:bg-(--surface-container) active:scale-[0.98]"
			>
				<HugeiconsIcon
					icon={PlusSignIcon}
					strokeWidth={2}
					className="h-4 w-4"
					aria-hidden="true"
				/>
				FOLLOW {company.name.replace(/ /g, "_").toUpperCase()}
			</button>
		</div>
	);
}

function CultureMetrics({ company }: { company: MockCompany }) {
	return (
		<div className="mb-6 border border-(--rule) p-6">
			<h4 className="mono-label mb-4 text-(--primary-container) uppercase tracking-[0.2em]">
				// culture
			</h4>
			<p className="mb-4 font-sans text-[13px] leading-relaxed text-(--body)">
				{company.culture}
			</p>
		</div>
	);
}

function TechStackSection({ company }: { company: MockCompany }) {
	return (
		<div className="mb-6 border border-(--rule) p-6">
			<h4 className="mono-label mb-4 text-(--primary-container) uppercase tracking-[0.2em]">
				// tech_stack
			</h4>
			<div className="flex flex-wrap gap-2">
				{company.techStack.map((tech) => (
					<span
						key={tech}
						className="mono-label border border-(--rule) px-2 py-1 text-[10px] uppercase text-(--dim)"
					>
						{tech}
					</span>
				))}
			</div>
		</div>
	);
}

function LeadershipSection({ company }: { company: MockCompany }) {
	return (
		<div className="border border-(--rule) p-6">
			<h4 className="mono-label mb-4 text-(--primary-container) uppercase tracking-[0.2em]">
				// leadership
			</h4>
			<div className="flex flex-col gap-3">
				{company.leadership.map((person) => (
					<div key={person.name} className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center border border-(--rule) bg-(--surface-container-low)">
							<span className="font-sans text-[11px] font-bold uppercase text-(--dim)">
								{person.name
									.split(" ")
									.map((n) => n[0])
									.join("")}
							</span>
						</div>
						<div>
							<p className="font-sans text-[13px] text-(--on-surface)">
								{person.name}
							</p>
							<p className="font-sans text-[11px] text-(--dim)">
								{person.role}
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
