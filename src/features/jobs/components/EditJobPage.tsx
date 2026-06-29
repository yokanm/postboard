import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthErrorBanner } from "@/features/auth/components/AuthErrorBanner";
import { isApiRequestError } from "@/lib/api/client";
import { useJob, useTags, useUpdateJob } from "../hooks";
import { type CreateJobFormValues, createJobSchema } from "../schemas";

interface EditJobPageProps {
	jobId: string;
}

export function EditJobPage({ jobId }: EditJobPageProps) {
	const navigate = useNavigate();
	const { data: job, isLoading: jobLoading } = useJob(jobId);
	const updateMutation = useUpdateJob();
	const { data: tagsData } = useTags();
	const tags = tagsData?.tags ?? [];

	const form = useForm<CreateJobFormValues>({
		resolver: zodResolver(createJobSchema),
		defaultValues: {
			title: "",
			description: "",
			location: "",
			locationType: "ONSITE",
			experienceLevel: "MID",
			salaryMin: "",
			salaryMax: "",
			currency: "USD",
			tags: [],
			expiresAt: "",
		},
	});

	useEffect(() => {
		if (job) {
			form.reset({
				title: job.title,
				description: job.description,
				location: job.location ?? "",
				locationType: job.locationType,
				experienceLevel: job.experienceLevel,
				salaryMin: job.salaryMin?.toString() ?? "",
				salaryMax: job.salaryMax?.toString() ?? "",
				currency: job.currency,
				tags: job.tags.map((t) => t.tag.name),
				expiresAt: job.expiresAt
					? new Date(job.expiresAt).toISOString().split("T")[0]
					: "",
			});
		}
	}, [job, form]);

	const isLoading = updateMutation.isPending || form.formState.isSubmitting;

	const apiErrorMessage = updateMutation.error
		? isApiRequestError(updateMutation.error)
			? updateMutation.error.message
			: "Failed to update job."
		: null;

	if (jobLoading) {
		return (
			<div className="mx-auto flex max-w-[640px] flex-col gap-6 p-6">
				<Skeleton className="h-8 w-48 rounded-none" />
				<Skeleton className="h-[600px] w-full rounded-none" />
			</div>
		);
	}

	if (!job) {
		return (
			<div className="flex flex-col gap-4 p-6">
				<p className="font-sans text-[14px] text-(--error)">Job not found.</p>
			</div>
		);
	}

	function onSubmit(values: CreateJobFormValues) {
		const payload = {
			title: values.title,
			description: values.description,
			location: values.location || undefined,
			locationType: values.locationType,
			experienceLevel: values.experienceLevel,
			salaryMin: values.salaryMin ? Number(values.salaryMin) : undefined,
			salaryMax: values.salaryMax ? Number(values.salaryMax) : undefined,
			currency: values.currency || "USD",
			tags: values.tags?.filter(Boolean) || undefined,
			expiresAt: values.expiresAt || undefined,
		};
		updateMutation.mutate(
			{ id: jobId, input: payload },
			{
				onSuccess() {
					navigate({ to: "/recruiter/jobs", search: {} });
				},
			},
		);
	}

	const selectedTags = form.watch("tags") ?? [];

	function toggleTag(tagName: string) {
		const current = form.getValues("tags") ?? [];
		if (current.includes(tagName)) {
			form.setValue(
				"tags",
				current.filter((t) => t !== tagName),
			);
		} else {
			form.setValue("tags", [...current, tagName]);
		}
	}

	return (
		<div className="mx-auto flex max-w-[640px] flex-col gap-6 p-6">
			<header className="flex flex-col gap-1">
				<span className="mono-label text-(--primary-container)">
					// EDIT_JOB
				</span>
				<h1 className="font-headline m-0 text-(--on-surface)">
					Edit Job: {job.title}
				</h1>
				<p className="font-body m-0 text-(--body)">
					Update the job listing details.
				</p>
			</header>

			{apiErrorMessage && <AuthErrorBanner message={apiErrorMessage} />}

			<form
				onSubmit={form.handleSubmit(onSubmit)}
				noValidate
				className="flex flex-col gap-5"
			>
				<div className="flex flex-col gap-4 border border-(--rule) p-4">
					<h2 className="mono-label m-0 text-(--dim) uppercase">BASIC INFO</h2>

					<div className="flex flex-col gap-1.5">
						<label className="mono-label uppercase text-(--dim)">
							Job Title *
						</label>
						<input
							{...form.register("title")}
							type="text"
							className="border border-(--rule) bg-(--surface-container-low) px-3 py-2 font-sans text-[14px] text-(--on-surface) placeholder:text-(--dim) focus:outline-2 focus:outline-(--primary-container)"
						/>
						{form.formState.errors.title && (
							<p className="m-0 font-sans text-[12px] text-(--error)">
								{form.formState.errors.title.message}
							</p>
						)}
					</div>

					<div className="flex flex-col gap-1.5">
						<label className="mono-label uppercase text-(--dim)">
							Description *
						</label>
						<textarea
							{...form.register("description")}
							rows={8}
							className="border border-(--rule) bg-(--surface-container-low) px-3 py-2 font-sans text-[14px] text-(--on-surface) placeholder:text-(--dim) focus:outline-2 focus:outline-(--primary-container)"
						/>
						{form.formState.errors.description && (
							<p className="m-0 font-sans text-[12px] text-(--error)">
								{form.formState.errors.description.message}
							</p>
						)}
					</div>

					<div className="flex flex-col gap-1.5">
						<label className="mono-label uppercase text-(--dim)">
							Location
						</label>
						<input
							{...form.register("location")}
							type="text"
							className="border border-(--rule) bg-(--surface-container-low) px-3 py-2 font-sans text-[14px] text-(--on-surface) placeholder:text-(--dim) focus:outline-2 focus:outline-(--primary-container)"
						/>
					</div>

					<div className="flex flex-col gap-1.5">
						<label className="mono-label uppercase text-(--dim)">
							Location Type *
						</label>
						<select
							{...form.register("locationType")}
							className="border border-(--rule) bg-(--surface-container-low) px-3 py-2 font-sans text-[14px] text-(--on-surface) focus:outline-2 focus:outline-(--primary-container)"
						>
							<option value="ONSITE">On-site</option>
							<option value="REMOTE">Remote</option>
							<option value="HYBRID">Hybrid</option>
						</select>
					</div>
				</div>

				<div className="flex flex-col gap-4 border border-(--rule) p-4">
					<h2 className="mono-label m-0 text-(--dim) uppercase">
						COMPENSATION
					</h2>

					<div className="grid grid-cols-2 gap-4">
						<div className="flex flex-col gap-1.5">
							<label className="mono-label uppercase text-(--dim)">
								Min Salary
							</label>
							<input
								{...form.register("salaryMin")}
								type="number"
								min={0}
								className="border border-(--rule) bg-(--surface-container-low) px-3 py-2 font-sans text-[14px] text-(--on-surface) placeholder:text-(--dim) focus:outline-2 focus:outline-(--primary-container)"
							/>
						</div>
						<div className="flex flex-col gap-1.5">
							<label className="mono-label uppercase text-(--dim)">
								Max Salary
							</label>
							<input
								{...form.register("salaryMax")}
								type="number"
								min={0}
								className="border border-(--rule) bg-(--surface-container-low) px-3 py-2 font-sans text-[14px] text-(--on-surface) placeholder:text-(--dim) focus:outline-2 focus:outline-(--primary-container)"
							/>
						</div>
					</div>
					{form.formState.errors.salaryMax && (
						<p className="m-0 font-sans text-[12px] text-(--error)">
							{form.formState.errors.salaryMax.message}
						</p>
					)}

					<div className="flex flex-col gap-1.5">
						<label className="mono-label uppercase text-(--dim)">
							Experience Level *
						</label>
						<select
							{...form.register("experienceLevel")}
							className="border border-(--rule) bg-(--surface-container-low) px-3 py-2 font-sans text-[14px] text-(--on-surface) focus:outline-2 focus:outline-(--primary-container)"
						>
							<option value="JUNIOR">Junior</option>
							<option value="MID">Mid</option>
							<option value="SENIOR">Senior</option>
							<option value="LEAD">Lead</option>
						</select>
					</div>

					<div className="flex flex-col gap-1.5">
						<label className="mono-label uppercase text-(--dim)">
							Expires At
						</label>
						<input
							{...form.register("expiresAt")}
							type="date"
							className="border border-(--rule) bg-(--surface-container-low) px-3 py-2 font-sans text-[14px] text-(--on-surface) focus:outline-2 focus:outline-(--primary-container)"
						/>
					</div>
				</div>

				<div className="flex flex-col gap-4 border border-(--rule) p-4">
					<h2 className="mono-label m-0 text-(--dim) uppercase">TAGS</h2>
					<div className="flex flex-wrap gap-1.5">
						{tags.map((tag) => {
							const isActive = selectedTags.includes(tag.name);
							return (
								<button
									key={tag.id}
									type="button"
									onClick={() => toggleTag(tag.name)}
									className={`mono-label cursor-pointer border px-3 py-1.5 uppercase tracking-[0.05em] transition-colors duration-150 ${
										isActive
											? "border-(--primary-container) bg-(--primary-container) text-(--on-primary-container)"
											: "border-(--rule) bg-transparent text-(--dim) hover:border-(--primary-container) hover:text-(--primary-container)"
									}`}
								>
									{tag.name}
								</button>
							);
						})}
					</div>
				</div>

				<div className="flex justify-end gap-3">
					<button
						type="button"
						onClick={() => navigate({ to: "/recruiter/jobs", search: {} })}
						className="mono-label cursor-pointer border border-(--rule) bg-transparent px-6 py-3 uppercase tracking-[0.05em] text-(--dim) transition-colors duration-150 hover:border-(--on-surface) hover:text-(--on-surface)"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={isLoading}
						className="mono-label cursor-pointer border border-(--primary-container) bg-(--primary-container) px-6 py-3 uppercase tracking-[0.05em] text-(--on-primary-container) transition-colors duration-150 hover:bg-(--primary) disabled:opacity-50"
					>
						{isLoading ? "SAVING..." : "SAVE CHANGES"}
					</button>
				</div>
			</form>
		</div>
	);
}
