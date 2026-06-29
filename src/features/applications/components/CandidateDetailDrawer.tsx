import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import type { ApplicationListItem } from "../types";
import { ApplicationStatusBadge } from "./ApplicationStatusBadge";

interface CandidateDetailDrawerProps {
	application: ApplicationListItem | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CandidateDetailDrawer({
	application,
	open,
	onOpenChange,
}: CandidateDetailDrawerProps) {
	if (!application) return null;

	const name = `${application.user.firstName} ${application.user.lastName}`;
	const date = new Date(application.createdAt).toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-full border-l-(--rule) bg-(--surface) sm:max-w-md overflow-y-auto">
				<SheetHeader className="mb-6">
					<SheetTitle className="font-sans text-[18px] font-semibold text-(--on-surface)">
						{name}
					</SheetTitle>
					<SheetDescription className="mono-label text-(--dim)">
						{application.user.email}
					</SheetDescription>
				</SheetHeader>

				<div className="flex flex-col gap-6">
					{/* Status */}
					<div className="flex items-center justify-between border border-(--rule) px-4 py-3">
						<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
							Status
						</span>
						<ApplicationStatusBadge status={application.status} />
					</div>

					{/* Date */}
					<div className="flex items-center justify-between border border-(--rule) px-4 py-3">
						<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
							Applied
						</span>
						<span className="mono-label text-[11px] text-(--on-surface)">
							{date}
						</span>
					</div>

					{/* Resume */}
					<div className="flex flex-col gap-2 border border-(--rule) px-4 py-3">
						<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
							Resume
						</span>
						{application.resumeUrl ? (
							<a
								href={application.resumeUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="mono-label text-[11px] text-(--primary-container) no-underline transition-colors duration-150 hover:text-(--primary)"
							>
								View Resume →
							</a>
						) : (
							<span className="mono-label text-[11px] text-(--body)">
								{application.resumeUrl ?? "No resume submitted"}
							</span>
						)}
					</div>

					{/* Skills */}
					{application.user.profile?.skills &&
						application.user.profile.skills.length > 0 && (
							<div className="flex flex-col gap-2 border border-(--rule) px-4 py-3">
								<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
									Skills
								</span>
								<div className="flex flex-wrap gap-1.5">
									{application.user.profile.skills.map((skill) => (
										<span
											key={skill}
											className="mono-label rounded-[2px] bg-(--surface-container-high) px-2 py-0.5 text-[11px] text-(--body)"
										>
											{skill}
										</span>
									))}
								</div>
							</div>
						)}

					{/* Location */}
					{application.user.profile?.location && (
						<div className="flex items-center justify-between border border-(--rule) px-4 py-3">
							<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
								Location
							</span>
							<span className="mono-label text-[11px] text-(--on-surface)">
								{application.user.profile.location}
							</span>
						</div>
					)}

					{/* Cover Letter */}
					{application.coverLetter && (
						<div className="flex flex-col gap-2 border border-(--rule) px-4 py-3">
							<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
								Cover Letter
							</span>
							<p className="m-0 font-sans text-[13px] leading-relaxed text-(--body) whitespace-pre-wrap">
								{application.coverLetter}
							</p>
						</div>
					)}

					{/* Rejection Reason */}
					{application.rejectionReason && (
						<div className="flex flex-col gap-2 border border-(--error-container) bg-(--error-container) bg-opacity-10 px-4 py-3">
							<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--error)">
								Feedback
							</span>
							<p className="m-0 font-sans text-[13px] leading-relaxed text-(--body)">
								{application.rejectionReason}
							</p>
						</div>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}
