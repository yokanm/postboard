import { z } from "zod";

export const profileSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	phone: z.string().optional().or(z.literal("")),
	bio: z
		.string()
		.max(500, "Bio must be under 500 characters")
		.optional()
		.or(z.literal("")),
	location: z.string().optional().or(z.literal("")),
	linkedinUrl: z
		.string()
		.url("Must be a valid URL")
		.optional()
		.or(z.literal("")),
	githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
	websiteUrl: z
		.string()
		.url("Must be a valid URL")
		.optional()
		.or(z.literal("")),
	skills: z.array(z.string()).optional(),
});

export const profileUpdateSchema = profileSchema.omit({
	firstName: true,
	lastName: true,
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type ProfileUpdateValues = z.infer<typeof profileUpdateSchema>;
