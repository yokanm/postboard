import { useSavedJobsStore } from "@/stores/saved-jobs-store";

interface SavedJobsButtonProps {
	jobId: string;
}

export function SavedJobsButton({ jobId }: SavedJobsButtonProps) {
	const isSaved = useSavedJobsStore((s) => s.isSaved(jobId));
	const toggle = useSavedJobsStore((s) => s.toggle);

	return (
		<button
			type="button"
			onClick={() => toggle(jobId)}
			className={`mono-label cursor-pointer border px-4 py-2 uppercase tracking-[0.05em] transition-colors duration-150 ${
				isSaved
					? "border-(--primary-container) bg-(--primary-container) text-(--on-primary-container)"
					: "border-(--rule) bg-transparent text-(--dim) hover:border-(--primary-container) hover:text-(--primary-container)"
			}`}
			aria-label={isSaved ? "Remove from saved jobs" : "Save job"}
		>
			{isSaved ? "SAVED" : "SAVE"}
		</button>
	);
}

export function useSavedJobs(): string[] {
	return useSavedJobsStore((s) => s.savedIds);
}
