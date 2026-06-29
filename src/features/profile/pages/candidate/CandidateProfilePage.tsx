import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useCurrentUser } from "@/features/auth/hooks";
import { ProfileFormFields } from "../../components/ProfileFormFields";
import { ResumeSection } from "../../components/ResumeSection";
import { SkillsSection } from "../../components/SkillsSection";
import {
	useDeleteResume,
	useProfile,
	useUpdateProfile,
	useUploadResume,
} from "../../hooks";
import { type ProfileFormValues, profileSchema } from "../../schemas";

export function CandidateProfilePage() {
	const { data: user } = useCurrentUser();
	const { data, isLoading, isError, error } = useProfile();
	const updateProfile = useUpdateProfile();
	const uploadResume = useUploadResume();
	const deleteResume = useDeleteResume();

	const form = useForm<ProfileFormValues>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			phone: "",
			bio: "",
			location: "",
			linkedinUrl: "",
			githubUrl: "",
			websiteUrl: "",
			skills: [],
		},
	});

	useEffect(() => {
		if (data?.profile) {
			form.reset({
				firstName: user?.firstName ?? "",
				lastName: user?.lastName ?? "",
				phone: user?.phone ?? "",
				bio: data.profile.bio ?? "",
				location: data.profile.location ?? "",
				linkedinUrl: data.profile.linkedinUrl ?? "",
				githubUrl: data.profile.githubUrl ?? "",
				websiteUrl: "",
				skills: data.profile.skills ?? [],
			});
		}
	}, [data, user, form]);

	async function handleSubmit(values: ProfileFormValues) {
		try {
			await updateProfile.mutateAsync({
				bio: values.bio || undefined,
				location: values.location || undefined,
				linkedinUrl: values.linkedinUrl || undefined,
				githubUrl: values.githubUrl || undefined,
				skills: values.skills,
			});
		} catch {
			// error handled by mutation
		}
	}

	async function handleUploadResume(file: File) {
		const validTypes = [
			"application/pdf",
			"application/msword",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		];
		if (!validTypes.includes(file.type)) return;
		if (file.size > 10 * 1024 * 1024) return;
		try {
			await uploadResume.mutateAsync(file);
		} catch {
			// error handled by mutation
		}
	}

	function handleDeleteResume() {
		deleteResume.mutate();
	}

	const skillsValue = form.watch("skills") ?? [];

	const profileFields = [
		data?.profile?.bio,
		data?.profile?.location,
		data?.profile?.skills?.length,
		data?.profile?.resumeUrl,
		data?.profile?.linkedinUrl,
	];
	const filledFields = profileFields.filter(Boolean).length;
	const profileCompletion =
		profileFields.length > 0
			? Math.round((filledFields / profileFields.length) * 100)
			: 0;

	if (isLoading) {
		return (
			<div className="p-6">
				<div className="mb-6">
					<h2 className="font-headline text-2xl text-(--on-surface) sm:text-[32px]">
						Profile
					</h2>
					<p className="font-sans text-[15px] text-(--body)">Loading...</p>
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="p-6">
				<div className="mb-6">
					<h2 className="font-headline text-2xl text-(--on-surface) sm:text-[32px]">
						Profile
					</h2>
					<p className="font-sans text-[15px] text-(--error)">
						{error instanceof Error ? error.message : "Failed to load profile."}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="p-4 sm:p-6">
			<div className="mb-6">
				<span className="mono-label text-(--primary-container)">
					// CANDIDATE_PROFILE
				</span>
				<h2 className="font-headline text-2xl text-(--on-surface) sm:text-[32px]">
					Profile
				</h2>
				<p className="font-sans text-[15px] text-(--body)">
					Manage your personal information and resume.
				</p>
			</div>

			{/* Completeness Bar */}
			<div className="mb-6 border border-(--rule) p-4">
				<div className="mb-2 flex items-center justify-between">
					<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
						// PROFILE_COMPLETENESS
					</span>
					<span className="font-serif text-lg text-(--primary)">
						{profileCompletion}%
					</span>
				</div>
				<div className="h-1.5 w-full bg-(--surface-container-high)">
					<div
						className={`h-full transition-all ${profileCompletion === 100 ? "bg-(--live)" : "bg-(--primary)"}`}
						style={{ width: `${profileCompletion}%` }}
						role="progressbar"
						aria-valuenow={profileCompletion}
						aria-valuemin={0}
						aria-valuemax={100}
					/>
				</div>
			</div>

			{/* Avatar Section */}
			<div className="mb-6 border border-(--rule) p-6">
				<span className="mono-label mb-4 block text-(--primary-container)">
					// PHOTO
				</span>
				<div className="flex items-center gap-6">
					<div className="flex h-24 w-24 items-center justify-center border-2 border-dashed border-(--rule) bg-(--surface-container-low)">
						<span className="font-sans text-[11px] uppercase text-(--dim)">
							AVATAR
						</span>
					</div>
					<div>
						<p className="font-sans text-[13px] text-(--body)">
							Upload a professional photo to make your profile stand out.
						</p>
						<p className="mono-label mt-1 text-[11px] text-(--dim)">
							JPG, PNG. Max 5MB.
						</p>
					</div>
				</div>
			</div>

			{updateProfile.isSuccess && (
				<div className="mb-4 border border-(--live-dim) bg-(--surface-container-low) px-4 py-3">
					<p className="font-sans text-[13px] text-(--live)">
						Profile updated successfully.
					</p>
				</div>
			)}

			<FormProvider {...form}>
				<form
					onSubmit={form.handleSubmit(handleSubmit)}
					className="flex flex-col gap-6"
				>
					<div className="border border-(--rule)">
						<div className="border-b border-(--rule) px-4 py-2">
							<span className="mono-label text-(--primary-container)">
								// PERSONAL_INFORMATION
							</span>
						</div>
						<div className="p-4">
							<ProfileFormFields />

							<div className="mt-4 flex justify-end">
								<button
									type="submit"
									disabled={updateProfile.isPending}
									className="mono-label cursor-pointer border border-(--primary) bg-(--primary) px-4 py-2 text-[11px] uppercase tracking-[0.05em] text-(--on-primary) transition-colors duration-150 hover:bg-(--primary-container) disabled:opacity-50"
								>
									{updateProfile.isPending ? "Saving..." : "Save Changes"}
								</button>
							</div>
						</div>
					</div>
				</form>
			</FormProvider>

			<div className="mt-6">
				<SkillsSection
					skills={skillsValue}
					onAdd={(skill) => {
						const current = form.getValues("skills") ?? [];
						form.setValue("skills", [...current, skill]);
					}}
					onRemove={(skill) => {
						const current = form.getValues("skills") ?? [];
						form.setValue(
							"skills",
							current.filter((s) => s !== skill),
						);
					}}
				/>
			</div>

			<div className="mt-6">
				<ResumeSection
					resumeUrl={data?.profile?.resumeUrl ?? null}
					isUploading={uploadResume.isPending}
					onUpload={handleUploadResume}
					onDelete={handleDeleteResume}
					uploadError={null}
				/>
			</div>
		</div>
	);
}
