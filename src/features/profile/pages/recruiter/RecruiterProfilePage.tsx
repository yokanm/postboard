import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useCurrentUser } from "@/features/auth/hooks";
import { ProfileFormFields } from "../../components/ProfileFormFields";
import { useProfile, useUpdateProfile } from "../../hooks";
import { type ProfileFormValues, profileSchema } from "../../schemas";

export function RecruiterProfilePage() {
	const { data: user } = useCurrentUser();
	const { data, isLoading, isError, error } = useProfile();
	const updateProfile = useUpdateProfile();

	const form = useForm<ProfileFormValues>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			bio: "",
			location: "",
			linkedinUrl: "",
			githubUrl: "",
		},
	});

	useEffect(() => {
		if (data?.profile) {
			form.reset({
				firstName: user?.firstName ?? "",
				lastName: user?.lastName ?? "",
				bio: data.profile.bio ?? "",
				location: data.profile.location ?? "",
				linkedinUrl: data.profile.linkedinUrl ?? "",
				githubUrl: data.profile.githubUrl ?? "",
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
			});
		} catch {
			// error handled by mutation
		}
	}

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
					// RECRUITER_PROFILE
				</span>
				<h2 className="font-headline text-2xl text-(--on-surface) sm:text-[32px]">
					Profile
				</h2>
				<p className="font-sans text-[15px] text-(--body)">
					Manage your professional information.
				</p>
			</div>

			{updateProfile.isSuccess && (
				<div className="mb-4 border border-(--live-dim) bg-(--surface-container-low) px-4 py-3">
					<p className="font-sans text-[13px] text-(--live)">
						Profile updated successfully.
					</p>
				</div>
			)}

			{user?.companyId && (
				<div className="mb-4 border border-(--rule) bg-(--surface-container-low) px-4 py-3">
					<p className="font-sans text-[13px] text-(--body)">
						Company: <span className="text-(--on-surface)">Associated</span>
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
		</div>
	);
}
