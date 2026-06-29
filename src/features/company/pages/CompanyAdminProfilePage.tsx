import { zodResolver } from "@hookform/resolvers/zod";
import {
	Briefcase01Icon,
	File01Icon,
	UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ErrorState } from "@/shared/components/ux/ErrorState";
import { LoadingState } from "@/shared/components/ux/LoadingState";
import { VerificationBadge } from "@/shared/components/ux/VerificationBadge";
import {
	useCompanyAnalytics,
	useCurrentCompany,
	useDeleteCompanyLogo,
	useUpdateCompany,
	useUploadCompanyLogo,
} from "../hooks";
import {
	companySizes,
	type UpdateCompanyFormValues,
	updateCompanySchema,
} from "../schemas";

export function CompanyAdminProfilePage() {
	const {
		data: companyResp,
		isLoading,
		isError,
		refetch,
	} = useCurrentCompany();
	const { data: analytics } = useCompanyAnalytics();
	const updateMutation = useUpdateCompany();
	const uploadLogo = useUploadCompanyLogo();
	const deleteLogo = useDeleteCompanyLogo();

	const form = useForm<UpdateCompanyFormValues>({
		resolver: zodResolver(updateCompanySchema),
		defaultValues: { name: "", website: "", industry: "", size: "" },
	});

	const {
		reset,
		handleSubmit,
		formState: { isDirty, errors },
	} = form;

	useEffect(() => {
		if (companyResp?.company) {
			reset({
				name: companyResp.company.name,
				website: companyResp.company.website ?? "",
				industry: companyResp.company.industry ?? "",
				size: (companyResp.company.size ??
					"") as UpdateCompanyFormValues["size"],
			});
		}
	}, [companyResp, reset]);

	const [logoError, setLogoError] = useState<string | null>(null);

	async function onLogoUpload(file: File) {
		setLogoError(null);
		const validTypes = ["image/jpeg", "image/png", "image/webp"];
		if (!validTypes.includes(file.type)) {
			setLogoError("Only JPG, PNG, and WebP files are accepted.");
			return;
		}
		if (file.size > 2 * 1024 * 1024) {
			setLogoError("File must be under 2MB.");
			return;
		}
		try {
			await uploadLogo.mutateAsync(file);
			toast.success("Logo uploaded");
		} catch {
			setLogoError("Failed to upload logo.");
		}
	}

	function onSave(values: UpdateCompanyFormValues) {
		updateMutation.mutate({
			name: values.name || undefined,
			website: values.website || undefined,
			industry: values.industry || undefined,
			size: (values.size as string) || undefined,
		});
	}

	if (isLoading) {
		return <LoadingState variant="page" message="Loading company profile..." />;
	}

	if (isError) {
		return (
			<div className="p-4 sm:p-6">
				<ErrorState
					message="Could not load company details"
					onRetry={() => refetch()}
				/>
			</div>
		);
	}

	const company = companyResp?.company;
	if (!company) {
		return (
			<div className="p-4 sm:p-6">
				<ErrorState message="No company found." />
			</div>
		);
	}

	const verificationStatus = company.isVerified
		? "VERIFIED"
		: ("PENDING" as const);

	return (
		<div className="flex flex-col gap-6 p-4 sm:p-6">
			<div className="flex flex-col gap-1">
				<span className="mono-label text-(--primary-container)">
					// COMPANY_PROFILE
				</span>
				<div className="flex items-center gap-3">
					<h1 className="font-headline m-0 text-(--on-surface) text-[24px] sm:text-[32px]">
						{company.name}
					</h1>
					<VerificationBadge status={verificationStatus} />
				</div>
				<p className="font-sans text-[14px] text-(--body)">
					Manage your company profile and branding.
				</p>
			</div>

			{analytics && (
				<div className="grid grid-cols-3 gap-4">
					<div className="border border-(--rule) p-4">
						<div className="flex items-center gap-2">
							<HugeiconsIcon
								icon={Briefcase01Icon}
								strokeWidth={2}
								className="h-4 w-4 text-(--primary-container)"
								aria-hidden="true"
							/>
							<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
								Active Jobs
							</span>
						</div>
						<p className="font-headline mt-2 text-[28px] text-(--on-surface)">
							{analytics.activeJobs}
						</p>
					</div>
					<div className="border border-(--rule) p-4">
						<div className="flex items-center gap-2">
							<HugeiconsIcon
								icon={File01Icon}
								strokeWidth={2}
								className="h-4 w-4 text-(--primary-container)"
								aria-hidden="true"
							/>
							<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
								Applications
							</span>
						</div>
						<p className="font-headline mt-2 text-[28px] text-(--on-surface)">
							{analytics.totalApplications}
						</p>
					</div>
					<div className="border border-(--rule) p-4">
						<div className="flex items-center gap-2">
							<HugeiconsIcon
								icon={UserGroupIcon}
								strokeWidth={2}
								className="h-4 w-4 text-(--primary-container)"
								aria-hidden="true"
							/>
							<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
								Team
							</span>
						</div>
						<p className="font-headline mt-2 text-[28px] text-(--on-surface)">
							{analytics.totalRecruiters}
						</p>
					</div>
				</div>
			)}

			<div className="border border-(--rule)">
				<div className="border-b border-(--rule) px-4 py-2">
					<span className="mono-label text-(--primary-container)">
						// COMPANY_LOGO
					</span>
				</div>
				<div className="flex flex-col gap-3 p-4">
					{company.logoUrl && (
						<div className="flex items-center gap-3">
							<img
								src={company.logoUrl}
								alt="Company logo"
								className="h-14 w-14 border border-(--rule) object-contain"
							/>
							<button
								type="button"
								onClick={() => deleteLogo.mutate()}
								disabled={deleteLogo.isPending}
								className="mono-label cursor-pointer bg-transparent px-2 py-1 text-[11px] uppercase tracking-[0.05em] text-(--error) transition-colors hover:text-(--destructive) disabled:opacity-50"
							>
								{deleteLogo.isPending ? "Removing..." : "Remove"}
							</button>
						</div>
					)}
					{!company.logoUrl && (
						<p className="font-sans text-[13px] text-(--dim)">
							No logo uploaded yet.
						</p>
					)}
					<input
						type="file"
						accept=".jpg,.jpeg,.png,.webp"
						onChange={(e) => {
							const file = e.target.files?.[0];
							if (file) onLogoUpload(file);
							e.target.value = "";
						}}
						className="hidden"
						id="company-logo-upload"
						aria-label="Upload company logo"
					/>
					<label
						htmlFor="company-logo-upload"
						className="mono-label inline-flex w-fit cursor-pointer items-center gap-2 border border-(--rule) bg-(--surface-container-low) px-3 py-2 text-[11px] uppercase tracking-[0.05em] text-(--body) transition-colors hover:bg-(--surface-container)"
					>
						{uploadLogo.isPending
							? "Uploading..."
							: company.logoUrl
								? "Replace Logo"
								: "Upload Logo"}
					</label>
					{logoError && (
						<p className="font-sans text-[13px] text-(--error)">{logoError}</p>
					)}
				</div>
			</div>

			{company.about && (
				<div className="border border-(--rule)">
					<div className="border-b border-(--rule) px-4 py-2">
						<span className="mono-label text-(--primary-container)">
							// ABOUT
						</span>
					</div>
					<div className="p-4">
						<p className="font-sans text-[14px] leading-relaxed text-(--body)">
							{company.about}
						</p>
					</div>
				</div>
			)}

			<form onSubmit={handleSubmit(onSave)} className="border border-(--rule)">
				<div className="border-b border-(--rule) px-4 py-2">
					<span className="mono-label text-(--primary-container)">
						// COMPANY_INFORMATION
					</span>
				</div>
				<div className="flex flex-col gap-4 p-4">
					<div className="flex flex-col gap-1">
						<label
							htmlFor="profile-name"
							className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)"
						>
							Company Name
						</label>
						<input
							{...form.register("name")}
							id="profile-name"
							type="text"
							className="h-9 border border-(--rule) bg-(--background) px-3 font-sans text-[13px] text-(--on-surface) outline-none focus-visible:border-(--primary-container) focus-visible:ring-[3px] focus-visible:ring-(--primary-container)"
						/>
						{errors.name && (
							<p className="font-sans text-[12px] text-(--error)">
								{errors.name.message}
							</p>
						)}
					</div>

					<div className="flex flex-col gap-1">
						<label
							htmlFor="profile-website"
							className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)"
						>
							Website
						</label>
						<input
							{...form.register("website")}
							id="profile-website"
							type="url"
							placeholder="https://example.com"
							className="h-9 border border-(--rule) bg-(--background) px-3 font-sans text-[13px] text-(--on-surface) outline-none placeholder:text-(--muted) focus-visible:border-(--primary-container) focus-visible:ring-[3px] focus-visible:ring-(--primary-container)"
						/>
						{errors.website && (
							<p className="font-sans text-[12px] text-(--error)">
								{errors.website.message}
							</p>
						)}
					</div>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="flex flex-col gap-1">
							<label
								htmlFor="profile-industry"
								className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)"
							>
								Industry
							</label>
							<input
								{...form.register("industry")}
								id="profile-industry"
								type="text"
								placeholder="e.g. Technology"
								className="h-9 border border-(--rule) bg-(--background) px-3 font-sans text-[13px] text-(--on-surface) outline-none placeholder:text-(--muted) focus-visible:border-(--primary-container) focus-visible:ring-[3px] focus-visible:ring-(--primary-container)"
							/>
							{errors.industry && (
								<p className="font-sans text-[12px] text-(--error)">
									{errors.industry.message}
								</p>
							)}
						</div>
						<div className="flex flex-col gap-1">
							<label
								htmlFor="profile-size"
								className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)"
							>
								Company Size
							</label>
							<select
								{...form.register("size")}
								id="profile-size"
								className="h-9 border border-(--rule) bg-(--background) px-3 font-sans text-[13px] text-(--on-surface) outline-none focus-visible:border-(--primary-container) focus-visible:ring-[3px] focus-visible:ring-(--primary-container)"
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

					<div className="flex items-center justify-between pt-2">
						{isDirty && (
							<p className="font-sans text-[12px] text-(--warning)">
								Unsaved changes
							</p>
						)}
						<div className="flex gap-2 ml-auto">
							{isDirty && (
								<button
									type="button"
									onClick={() => reset()}
									className="border border-(--rule) px-4 py-1.5 font-sans text-[12px] text-(--on-surface) transition-colors hover:bg-(--surface-container-low)"
								>
									Cancel
								</button>
							)}
							<button
								type="submit"
								disabled={updateMutation.isPending || !isDirty}
								className="border border-(--primary-container) bg-(--primary-container) px-4 py-1.5 font-sans text-[12px] text-(--on-primary-container) transition-colors hover:bg-(--press-amber) disabled:opacity-50"
							>
								{updateMutation.isPending ? "Saving..." : "Save Changes"}
							</button>
						</div>
					</div>
				</div>
			</form>
		</div>
	);
}
