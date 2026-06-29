import { z } from "zod";

export const createJobSchema = z
	.object({
		title: z
			.string()
			.min(3, "Title must be at least 3 characters")
			.max(150, "Title must be under 150 characters"),
		description: z
			.string()
			.min(50, "Description must be at least 50 characters"),
		location: z.string().optional(),
		locationType: z.enum(["REMOTE", "ONSITE", "HYBRID"]),
		experienceLevel: z.enum(["JUNIOR", "MID", "SENIOR", "LEAD"]),
		salaryMin: z.string().optional(),
		salaryMax: z.string().optional(),
		currency: z.string().min(3).max(5).optional(),
		tags: z.array(z.string()).max(15).optional(),
		expiresAt: z.string().optional(),
	})
	.refine(
		(data) => {
			if (data.salaryMin && data.salaryMax) {
				const min = Number(data.salaryMin);
				const max = Number(data.salaryMax);
				if (!isNaN(min) && !isNaN(max)) {
					return max >= min;
				}
			}
			return true;
		},
		{ message: "Max salary must be >= min salary", path: ["salaryMax"] },
	);

export type CreateJobFormValues = z.infer<typeof createJobSchema>;

export const updateJobSchema = createJobSchema.partial();
export type UpdateJobFormValues = z.infer<typeof updateJobSchema>;

export const applyJobSchema = z.object({
	coverLetter: z
		.string()
		.max(3000, "Cover letter must be under 3000 characters")
		.optional(),
	resumeUrl: z.string().url("Enter a valid URL").optional(),
});

export type ApplyJobFormValues = z.infer<typeof applyJobSchema>;
