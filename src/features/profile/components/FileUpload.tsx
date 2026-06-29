import { type ChangeEvent, useRef } from "react";

interface FileUploadProps {
	accept: string;
	maxSizeMB: number;
	label: string;
	onFileSelect: (file: File) => void;
	error?: string | null;
	isLoading?: boolean;
}

export function FileUpload({
	accept,
	maxSizeMB,
	label,
	onFileSelect,
	error,
	isLoading,
}: FileUploadProps) {
	const inputRef = useRef<HTMLInputElement>(null);

	function handleChange(e: ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		if (file.size > maxSizeMB * 1024 * 1024) return;
		onFileSelect(file);
		if (inputRef.current) inputRef.current.value = "";
	}

	return (
		<div>
			<input
				ref={inputRef}
				type="file"
				accept={accept}
				onChange={handleChange}
				className="hidden"
				id={`file-upload-${label.replace(/\s+/g, "-").toLowerCase()}`}
				aria-label={label}
			/>
			<label
				htmlFor={`file-upload-${label.replace(/\s+/g, "-").toLowerCase()}`}
				className="mono-label inline-flex cursor-pointer items-center gap-2 border border-(--rule) bg-(--surface-container-low) px-3 py-2 text-(--body) transition-colors duration-150 hover:bg-(--surface-container)"
			>
				{isLoading ? (
					<span className="text-(--dim)">Uploading...</span>
				) : (
					<span>{label}</span>
				)}
			</label>
			{error && (
				<p className="mt-1 font-sans text-[13px] text-(--error)">{error}</p>
			)}
		</div>
	);
}
