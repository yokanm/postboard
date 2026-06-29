import { useState } from "react";
import { useDeleteCompanyLogo, useUploadCompanyLogo } from "../hooks";

interface CompanyLogoUploadProps {
	logoUrl: string | null;
}

export function CompanyLogoUpload({ logoUrl }: CompanyLogoUploadProps) {
	const uploadLogo = useUploadCompanyLogo();
	const deleteLogo = useDeleteCompanyLogo();
	const [error, setError] = useState<string | null>(null);

	async function handleUpload(file: File) {
		setError(null);
		const validTypes = ["image/jpeg", "image/png"];
		if (!validTypes.includes(file.type)) {
			setError("Only JPG and PNG files are accepted.");
			return;
		}
		if (file.size > 2 * 1024 * 1024) {
			setError("File must be under 2MB.");
			return;
		}
		try {
			await uploadLogo.mutateAsync(file);
		} catch {
			setError("Failed to upload logo.");
		}
	}

	return (
		<div className="border border-(--rule)">
			<div className="border-b border-(--rule) px-4 py-2">
				<span className="mono-label text-(--primary-container)">
					// COMPANY_LOGO
				</span>
			</div>
			<div className="flex flex-col gap-3 p-4">
				{logoUrl && (
					<div className="flex items-center gap-3">
						<img
							src={logoUrl}
							alt="Company logo"
							className="h-12 w-12 border border-(--rule) object-contain"
						/>
						<button
							type="button"
							onClick={() => deleteLogo.mutate()}
							disabled={deleteLogo.isPending}
							className="mono-label cursor-pointer bg-transparent px-2 py-1 text-[11px] uppercase tracking-[0.05em] text-(--error) transition-colors duration-150 hover:text-(--destructive) disabled:opacity-50"
						>
							Remove
						</button>
					</div>
				)}

				{!logoUrl && (
					<p className="font-sans text-[13px] text-(--dim)">
						No logo uploaded yet.
					</p>
				)}

				<input
					type="file"
					accept=".jpg,.jpeg,.png"
					onChange={(e) => {
						const file = e.target.files?.[0];
						if (file) handleUpload(file);
						e.target.value = "";
					}}
					className="hidden"
					id="company-logo-upload"
					aria-label="Upload company logo"
				/>
				<label
					htmlFor="company-logo-upload"
					className="mono-label inline-flex w-fit cursor-pointer items-center gap-2 border border-(--rule) bg-(--surface-container-low) px-3 py-2 text-[11px] uppercase tracking-[0.05em] text-(--body) transition-colors duration-150 hover:bg-(--surface-container)"
				>
					{uploadLogo.isPending
						? "Uploading..."
						: logoUrl
							? "Replace Logo"
							: "Upload Logo"}
				</label>

				{error && (
					<p className="font-sans text-[13px] text-(--error)">{error}</p>
				)}
			</div>
		</div>
	);
}
