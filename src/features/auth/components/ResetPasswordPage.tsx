import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link, useSearch } from "@tanstack/react-router";
import { useForm } from "react-hook-form";

import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { isApiRequestError } from "@/lib/api/client";
import { PasswordField } from "@/shared/components/forms/PasswordField";
import { useResetPassword } from "../hooks";
import { AuthLayout } from "../layout/AuthLayout";
import { type ResetPasswordFormValues, resetPasswordSchema } from "../schemas";
import { AuthErrorBanner } from "./AuthErrorBanner";
import { AuthSubmitButton } from "./AuthSubmitButton";
import { SuccessBanner } from "./SuccessBanner";

export function ResetPasswordPage() {
	const resetMutation = useResetPassword();
	const search = useSearch({ from: "/reset-password" });
	const token = search.token;

	const form = useForm<ResetPasswordFormValues>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: { password: "", confirmPassword: "" },
	});

	const passwordValue = form.watch("password");
	const isLoading = resetMutation.isPending || form.formState.isSubmitting;

	const apiErrorMessage = resetMutation.error
		? isApiRequestError(resetMutation.error)
			? resetMutation.error.message
			: "Password reset failed. Please try again."
		: null;

	const isSuccess = resetMutation.isSuccess;

	function onSubmit(values: ResetPasswordFormValues) {
		if (!token) return;
		resetMutation.mutate({ token, password: values.password });
	}

	if (!token) {
		return (
			<AuthLayout>
				<div className="flex w-full max-w-[380px] flex-col gap-6">
					<header className="flex flex-col gap-2">
						<span className="mono-label block text-(--primary-container)">
							// INVALID_LINK
						</span>
						<h1 className="font-headline m-0 text-(--on-surface)">
							Invalid Reset Link
						</h1>
						<p className="font-body m-0 text-(--body)">
							This reset link is invalid or has expired. Please request a new
							one.
						</p>
					</header>
					<Link
						to="/forgot-password"
						className="inline-flex items-center gap-2 text-(--primary-container) no-underline transition-colors duration-150 hover:text-(--primary)"
					>
						<span className="mono-label uppercase tracking-[0.05em]">
							Request New Link
						</span>
					</Link>
				</div>
			</AuthLayout>
		);
	}

	return (
		<AuthLayout>
			<div className="flex w-full max-w-[380px] flex-col gap-6">
				<div className="mb-1 flex flex-col lg:hidden">
					<span className="font-[20px] font-black tracking-[-0.02em] uppercase text-(--on-surface) font-serif">
						POSTBOARD
					</span>
				</div>

				<header className="flex flex-col gap-2">
					<span className="mono-label block text-(--primary-container)">
						// NEW_PASSWORD
					</span>
					<h1 className="font-headline m-0 text-(--on-surface)">
						Choose a new password
					</h1>
				</header>

				{apiErrorMessage && <AuthErrorBanner message={apiErrorMessage} />}

				{isSuccess ? (
					<div className="flex flex-col gap-4">
						<SuccessBanner message="Your password has been reset successfully." />
						<Link
							to="/login"
							className="inline-flex items-center gap-2 text-(--primary-container) no-underline transition-colors duration-150 hover:text-(--primary)"
						>
							<HugeiconsIcon
								icon={ArrowLeft01Icon}
								strokeWidth={2}
								className="h-3.5 w-3.5"
								aria-hidden="true"
							/>
							<span className="mono-label uppercase tracking-[0.05em]">
								Back to Login
							</span>
						</Link>
					</div>
				) : (
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							noValidate
							className="flex flex-col gap-6"
							aria-label="Reset your password"
						>
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem className="flex flex-col gap-2">
										<FormLabel className="mono-label uppercase text-(--dim)">
											New Password
										</FormLabel>
										<PasswordField
											label=""
											name={field.name}
											value={field.value}
											onChange={field.onChange}
											onBlur={field.onBlur}
											error={form.formState.errors.password}
											autoComplete="new-password"
											placeholder="New password"
											showStrength
											showRequirements
										/>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="confirmPassword"
								render={({ field }) => (
									<FormItem className="flex flex-col gap-2">
										<FormLabel className="mono-label uppercase text-(--dim)">
											Confirm Password
										</FormLabel>
										<PasswordField
											label=""
											name={field.name}
											value={field.value}
											onChange={field.onChange}
											onBlur={field.onBlur}
											error={form.formState.errors.confirmPassword}
											autoComplete="new-password"
											placeholder="Confirm password"
											showConfirmMatch
											confirmValue={passwordValue}
										/>
									</FormItem>
								)}
							/>

							<AuthSubmitButton
								label="SET NEW PASSWORD"
								isLoading={isLoading}
							/>
						</form>
					</Form>
				)}

				<footer className="flex items-center justify-between border-t border-(--rule) pt-6">
					<span className="mono-label text-(--dim)">© 2024 PB_IND</span>
					<span className="mono-label text-(--dim)">POSTBOARD_V1.0.0</span>
				</footer>
			</div>
		</AuthLayout>
	);
}
