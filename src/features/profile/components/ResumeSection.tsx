interface ResumeSectionProps {
	resumeUrl: string | null;
	isUploading: boolean;
	onUpload: (file: File) => void;
	onDelete: () => void;
	uploadError: string | null;
}

export function ResumeSection({
	resumeUrl,
	isUploading,
	onUpload,
	onDelete,
	uploadError,
}: ResumeSectionProps) {
	return (
		<div className="border border-(--rule)">
			<div className="border-b border-(--rule) px-4 py-2">
				<span className="mono-label text-(--primary-container)">// RESUME</span>
			</div>
			<div className="flex flex-col gap-3 p-4">
				{resumeUrl ? (
					<div className="flex items-center gap-3">
						<a
							href={resumeUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="font-sans text-[13px] text-(--primary) underline underline-offset-2"
						>
							View Resume
						</a>
						<button
							type="button"
							onClick={onDelete}
							className="mono-label cursor-pointer bg-transparent px-2 py-1 text-[11px] uppercase tracking-[0.05em] text-(--error) transition-colors duration-150 hover:text-(--destructive)"
							aria-label="Remove resume"
						>
							Remove
						</button>
					</div>
				) : (
					<p className="font-sans text-[13px] text-(--dim)">
						No resume uploaded yet.
					</p>
				)}

				<input
					type="file"
					accept=".pdf,.doc,.docx"
					onChange={(e) => {
						const file = e.target.files?.[0];
						if (file) onUpload(file);
						e.target.value = "";
					}}
					className="hidden"
					id="resume-upload"
					aria-label="Upload resume"
				/>
				<label
					htmlFor="resume-upload"
					className="mono-label inline-flex w-fit cursor-pointer items-center gap-2 border border-(--rule) bg-(--surface-container-low) px-3 py-2 text-[11px] uppercase tracking-[0.05em] text-(--body) transition-colors duration-150 hover:bg-(--surface-container)"
				>
					{isUploading
						? "Uploading..."
						: resumeUrl
							? "Replace Resume"
							: "Upload Resume"}
				</label>
				{uploadError && (
					<p className="font-sans text-[13px] text-(--error)">{uploadError}</p>
				)}
			</div>
		</div>
	);
}
