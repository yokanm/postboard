import {
	ArrowLeft01Icon,
	Bookmark01Icon,
	BookmarkAddIcon,
	CheckmarkCircle01Icon,
	Share07Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";

interface JobDetailMobileBarProps {
	onShare: () => void;
	shareCopied: boolean;
	isSaved: boolean;
	onBookmark: () => void;
	isAuthenticated: boolean;
	isCandidate: boolean;
	jobOpen: boolean;
	hasApplied: boolean;
	onApply: () => void;
}

export function JobDetailMobileBar({
	onShare,
	shareCopied,
	isSaved,
	onBookmark,
	isAuthenticated,
	isCandidate,
	jobOpen,
	hasApplied,
	onApply,
}: JobDetailMobileBarProps) {
	return (
		<div className="fixed bottom-0 left-0 z-40 w-full border-t border-(--rule) bg-(--surface-container)/95 backdrop-blur-sm md:hidden">
			<div className="flex items-center gap-2 px-4 py-3">
				<Link
					to="/jobs"
					search={{}}
					className="flex cursor-pointer items-center gap-1.5 border border-(--rule) px-3 py-2 text-(--dim) no-underline transition-colors hover:text-(--on-surface)"
					aria-label="Back to all roles"
				>
					<HugeiconsIcon
						icon={ArrowLeft01Icon}
						strokeWidth={2}
						className="h-4 w-4"
					/>
				</Link>
				<button
					type="button"
					onClick={onShare}
					className="flex cursor-pointer items-center gap-1.5 border border-(--rule) px-3 py-2 text-(--dim) transition-colors hover:text-(--on-surface)"
					aria-label={shareCopied ? "Link copied" : "Share job"}
				>
					<HugeiconsIcon
						icon={Share07Icon}
						strokeWidth={2}
						className="h-4 w-4"
					/>
					<span className="mono-label text-[10px] uppercase">
						{shareCopied ? "Copied" : "Share"}
					</span>
				</button>
				{isAuthenticated && (
					<button
						type="button"
						onClick={onBookmark}
						className="flex cursor-pointer items-center gap-1.5 border border-(--rule) px-3 py-2 text-(--dim) transition-colors hover:text-(--primary)"
						aria-label={isSaved ? "Remove from saved jobs" : "Save job"}
					>
						<HugeiconsIcon
							icon={isSaved ? BookmarkAddIcon : Bookmark01Icon}
							strokeWidth={2}
							className="h-4 w-4"
						/>
						<span className="mono-label text-[10px] uppercase">
							{isSaved ? "Saved" : "Save"}
						</span>
					</button>
				)}
				{isCandidate && jobOpen && !hasApplied && (
					<button
						type="button"
						onClick={onApply}
						aria-label="Apply to this job"
						className="ml-auto flex-1 bg-(--primary-container) px-4 py-2.5 font-mono-label text-mono-label font-bold uppercase tracking-widest text-(--on-primary-container) transition-all hover:brightness-110 active:scale-95"
					>
						Apply Now
					</button>
				)}
				{isCandidate && hasApplied && (
					<div
						className="ml-auto flex flex-1 items-center justify-center gap-2 border border-(--live)/30 bg-(--live-dim)/10 px-4 py-2.5"
						role="status"
						aria-live="polite"
					>
						<HugeiconsIcon
							icon={CheckmarkCircle01Icon}
							strokeWidth={2}
							className="h-5 w-5 text-(--live)"
						/>
						<span className="font-mono-label text-mono-label font-bold uppercase tracking-widest text-(--live)">
							Applied
						</span>
					</div>
				)}
			</div>
		</div>
	);
}
