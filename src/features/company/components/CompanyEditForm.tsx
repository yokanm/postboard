import { useEffect, useState } from "react";
import { useUpdateCompany } from "../hooks";
import { companySizes } from "../schemas";
import type { CompanyProfile } from "../types";

interface CompanyEditFormProps {
	company: CompanyProfile;
	onSuccess: () => void;
}

export function CompanyEditForm({ company, onSuccess }: CompanyEditFormProps) {
	const updateCompany = useUpdateCompany();
	const [name, setName] = useState(company.name);
	const [website, setWebsite] = useState(company.website ?? "");
	const [industry, setIndustry] = useState(company.industry ?? "");
	const [size, setSize] = useState(company.size ?? "");

	useEffect(() => {
		setName(company.name);
		setWebsite(company.website ?? "");
		setIndustry(company.industry ?? "");
		setSize(company.size ?? "");
	}, [company]);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		await updateCompany.mutateAsync({
			name: name || undefined,
			website: website || undefined,
			industry: industry || undefined,
			size: (size as CompanyProfile["size"]) || undefined,
		});
		onSuccess();
	}

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4">
			<div className="flex flex-col gap-1">
				<label
					htmlFor="company-name"
					className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)"
				>
					Company Name
				</label>
				<input
					id="company-name"
					type="text"
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="border border-(--rule) bg-(--surface-container-low) px-3 py-2 font-sans text-[15px] text-(--on-surface) outline-none focus:border-(--primary)"
				/>
			</div>

			<div className="flex flex-col gap-1">
				<label
					htmlFor="company-website"
					className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)"
				>
					Website
				</label>
				<input
					id="company-website"
					type="url"
					value={website}
					onChange={(e) => setWebsite(e.target.value)}
					placeholder="https://example.com"
					className="border border-(--rule) bg-(--surface-container-low) px-3 py-2 font-sans text-[15px] text-(--on-surface) outline-none placeholder:text-(--dim) focus:border-(--primary)"
				/>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div className="flex flex-col gap-1">
					<label
						htmlFor="company-industry"
						className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)"
					>
						Industry
					</label>
					<input
						id="company-industry"
						type="text"
						value={industry}
						onChange={(e) => setIndustry(e.target.value)}
						placeholder="e.g. Technology"
						className="border border-(--rule) bg-(--surface-container-low) px-3 py-2 font-sans text-[15px] text-(--on-surface) outline-none placeholder:text-(--dim) focus:border-(--primary)"
					/>
				</div>
				<div className="flex flex-col gap-1">
					<label
						htmlFor="company-size"
						className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)"
					>
						Company Size
					</label>
					<select
						id="company-size"
						value={size}
						onChange={(e) => setSize(e.target.value)}
						className="border border-(--rule) bg-(--surface-container-low) px-3 py-2 font-sans text-[15px] text-(--on-surface) outline-none focus:border-(--primary)"
					>
						<option value="">Select size...</option>
						{companySizes.map((s) => (
							<option key={s} value={s}>
								{s} employees
							</option>
						))}
					</select>
				</div>
			</div>

			<div className="flex justify-end">
				<button
					type="submit"
					disabled={updateCompany.isPending}
					className="mono-label cursor-pointer border border-(--primary) bg-(--primary) px-4 py-2 text-[11px] uppercase tracking-[0.05em] text-(--on-primary) transition-colors duration-150 hover:bg-(--primary-container) disabled:opacity-50"
				>
					{updateCompany.isPending ? "Saving..." : "Save Changes"}
				</button>
			</div>
		</form>
	);
}
