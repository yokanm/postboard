import { z } from "zod";

export const loginSchema = z.object({
	email: z
		.string()
		.min(1, "Email is required")
		.email("Enter a valid email address"),
	password: z
		.string()
		.min(1, "Password is required")
		.min(8, "Password must be at least 8 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
	.object({
		firstName: z
			.string()
			.min(1, "First name is required")
			.min(2, "First name must be at least 2 characters")
			.max(50, "First name must be under 50 characters"),
		lastName: z
			.string()
			.min(1, "Last name is required")
			.min(2, "Last name must be at least 2 characters")
			.max(50, "Last name must be under 50 characters"),
		userName: z
			.string()
			.min(1, "Username is required")
			.min(3, "Username must be at least 3 characters")
			.max(30, "Username must be under 30 characters")
			.regex(
				/^[a-zA-Z0-9_-]+$/,
				"Username can only contain letters, numbers, hyphens, and underscores",
			),
		email: z
			.string()
			.min(1, "Email is required")
			.email("Enter a valid email address"),
		password: z
			.string()
			.min(1, "Password is required")
			.min(8, "Password must be at least 8 characters")
			.regex(/[A-Z]/, "Must contain at least one uppercase letter")
			.regex(/[0-9]/, "Must contain at least one number"),
		confirmPassword: z.string().min(1, "Confirm password is required"),
		role: z.enum(["CANDIDATE", "RECRUITER"], {
			message: "Select your operational role",
		}),
		companyId: z.string().optional(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	})
	.refine(
		(data) => {
			if (data.role === "RECRUITER") {
				return !!data.companyId && data.companyId.length > 0;
			}
			return true;
		},
		{
			message: "Company ID is required for recruiters",
			path: ["companyId"],
		},
	);

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
	email: z
		.string()
		.min(1, "Email is required")
		.email("Enter a valid email address"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
	.object({
		password: z
			.string()
			.min(1, "Password is required")
			.min(8, "Password must be at least 8 characters")
			.regex(/[A-Z]/, "Must contain at least one uppercase letter")
			.regex(/[0-9]/, "Must contain at least one number"),
		confirmPassword: z.string().min(1, "Confirm password is required"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
