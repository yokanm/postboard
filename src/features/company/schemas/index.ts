import { z } from "zod";

export const companySizes = [
	"1-10",
	"11-50",
	"51-200",
	"201-500",
	"501-1000",
	"1000+",
] as const;

export const updateCompanySchema = z.object({
	name: z.string().min(2).max(100).optional().or(z.literal("")),
	website: z.string().url().optional().or(z.literal("")),
	industry: z.string().max(100).optional().or(z.literal("")),
	size: z.enum(companySizes).optional().or(z.literal("")),
});

export type UpdateCompanyFormValues = z.infer<typeof updateCompanySchema>;

export const inviteMemberSchema = z.object({
	email: z.string().email("Valid email is required"),
	role: z.enum(["RECRUITER", "CANDIDATE"]).optional(),
});

export type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;
