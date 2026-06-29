import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useApplyToJob } from "@/features/applications/hooks";
import { AuthErrorBanner } from "@/features/auth/components/AuthErrorBanner";
import { useCurrentUser } from "@/features/auth/hooks";
import { useProfile } from "@/features/profile/hooks";
import { isApiRequestError } from "@/lib/api/client";
import { type ApplyJobFormValues, applyJobSchema } from "../schemas";

interface ApplyModalProps {
	jobId: string;
	jobTitle: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

export function ApplyModal({
	jobId,
	jobTitle,
	open,
	onOpenChange,
	onSuccess,
}: ApplyModalProps) {
	const applyMutation = useApplyToJob();
	const { data: user } = useCurrentUser();
	const { data: profileData } = useProfile();
	const [confirmed, setConfirmed] = useState(false);

	const form = useForm<ApplyJobFormValues>({
		resolver: zodResolver(applyJobSchema),
		defaultValues: { coverLetter: "", resumeUrl: "" },
	});

	const coverLetter = form.watch("coverLetter") ?? "";
	const charCount = coverLetter.length;
	const charLimit = 3000;
	const isOverLimit = charCount > charLimit;

	const isLoading = applyMutation.isPending || form.formState.isSubmitting;

	const apiErrorMessage = applyMutation.error
		? isApiRequestError(applyMutation.error)
			? applyMutation.error.message
			: "Application failed. Please try again."
		: null;

	function onSubmit(values: ApplyJobFormValues) {
		if (!confirmed) return;
		applyMutation.mutate(
			{ jobId, input: values },
			{
				onSuccess() {
					onSuccess?.();
					onOpenChange(false);
					form.reset();
					setConfirmed(false);
				},
			},
		);
	}

	const resumeUrl = profileData?.profile?.resumeUrl;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-[560px] rounded-none border-(--rule) bg-(--surface) p-0">
				<DialogHeader className="border-b border-(--rule) px-5 py-4">
					<DialogTitle className="font-sans text-[15px] font-semibold text-(--on-surface)">
						Apply: {jobTitle}
					</DialogTitle>
				</DialogHeader>

				<div className="flex max-h-[716px] flex-col gap-4 overflow-y-auto px-5 py-4">
					{apiErrorMessage && <AuthErrorBanner message={apiErrorMessage} />}

					{applyMutation.isSuccess ? (
						<div className="border border-(--live) bg-(--live) bg-opacity-10 p-4">
							<p className="m-0 font-sans text-[14px] text-(--live)">
								Application submitted successfully.
							</p>
						</div>
					) : (
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								noValidate
								className="flex flex-col gap-4"
							>
								{/* Profile Card */}
								<div className="border border-(--rule) bg-(--surface-container-low) p-3">
									<div className="flex items-center gap-3">
										<div className="flex h-10 w-10 items-center justify-center border border-(--rule) bg-(--surface-container)">
											<span className="font-mono-label text-[14px] uppercase text-(--dim)">
												{user?.firstName?.charAt(0)}
												{user?.lastName?.charAt(0)}
											</span>
										</div>
										<div>
											<p className="font-sans text-[14px] font-medium text-(--on-surface)">
												{user?.firstName} {user?.lastName}
											</p>
											<p className="mono-label text-[11px] text-(--dim)">
												{user?.email}
											</p>
										</div>
									</div>
								</div>

								{/* Resume Display */}
								{resumeUrl && (
									<div className="flex items-center justify-between border border-(--rule) px-3 py-2">
										<div className="flex items-center gap-2">
											<span className="mono-label truncate text-[11px] text-(--dim) max-w-[240px]">
												{resumeUrl.split("/").pop() ?? "Resume"}
											</span>
										</div>
										<a
											href={resumeUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="mono-label shrink-0 text-[11px] text-(--primary) hover:underline"
										>
											View
										</a>
									</div>
								)}

								{/* Cover Letter */}
								<FormField
									control={form.control}
									name="coverLetter"
									render={({ field }) => (
										<FormItem className="flex flex-col gap-1.5">
											<FormLabel className="mono-label uppercase text-(--dim)">
												Cover Letter
											</FormLabel>
											<FormControl>
												<div className="relative">
													<textarea
														{...field}
														rows={5}
														placeholder="Brief cover letter (optional)"
														className="w-full resize-none border border-(--rule) bg-(--surface-container-low) px-3 py-2 font-sans text-[14px] text-(--on-surface) placeholder:text-(--dim) focus:outline-2 focus:outline-(--primary-container)"
													/>
													<span
														className={`mono-label absolute bottom-2 right-2 text-[11px] ${
															isOverLimit
																? "text-(--destructive)"
																: "text-(--dim)"
														}`}
													>
														{charCount}/{charLimit}
													</span>
												</div>
											</FormControl>
											<FormMessage className="font-sans text-[12px] text-(--error)" />
										</FormItem>
									)}
								/>

								{/* Resume URL */}
								<FormField
									control={form.control}
									name="resumeUrl"
									render={({ field }) => (
										<FormItem className="flex flex-col gap-1.5">
											<FormLabel className="mono-label uppercase text-(--dim)">
												Resume URL (optional)
											</FormLabel>
											<FormControl>
												<Input
													{...field}
													type="url"
													placeholder="https://example.com/resume.pdf"
												/>
											</FormControl>
											<FormMessage className="font-sans text-[12px] text-(--error)" />
										</FormItem>
									)}
								/>

								{/* Confirmation Checkbox */}
								<label className="flex cursor-pointer items-start gap-3 border border-(--rule) p-3">
									<input
										type="checkbox"
										checked={confirmed}
										onChange={(e) => setConfirmed(e.target.checked)}
										className="mt-0.5 h-4 w-4 rounded-none border-(--rule) bg-(--surface-container-low) text-(--primary) focus:ring-(--primary)"
									/>
									<span className="font-sans text-[13px] text-(--body)">
										I confirm that the information provided is accurate and I
										consent to the processing of my application data.
									</span>
								</label>

								<div className="flex justify-end gap-3 pt-2">
									<button
										type="button"
										onClick={() => onOpenChange(false)}
										className="mono-label cursor-pointer border border-(--rule) bg-transparent px-4 py-2 uppercase tracking-[0.05em] text-(--dim) transition-colors duration-150 hover:border-(--on-surface) hover:text-(--on-surface)"
									>
										Cancel
									</button>
									<button
										type="submit"
										disabled={isLoading || !confirmed || isOverLimit}
										className="mono-label cursor-pointer border border-(--primary-container) bg-(--primary-container) px-4 py-2 uppercase tracking-[0.05em] text-(--on-primary-container) transition-colors duration-150 hover:bg-(--primary) disabled:opacity-50"
									>
										{isLoading ? "SUBMITTING..." : "SUBMIT APPLICATION"}
									</button>
								</div>
							</form>
						</Form>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
