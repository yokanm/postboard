import { zodResolver } from "@hookform/resolvers/zod";
import { UserMultiple02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link, useSearch } from "@tanstack/react-router";
import { useForm } from "react-hook-form";

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { isApiError } from "@/lib/api/client";
import { PasswordField } from "@/shared/components/forms/PasswordField";
import { useLogin } from "../hooks";
import { AuthLayout } from "../layout/AuthLayout";
import { type LoginFormValues, loginSchema } from "../schemas";
import { AuthErrorBanner } from "./AuthErrorBanner";
import { AuthSubmitButton } from "./AuthSubmitButton";
import { SuccessBanner } from "./SuccessBanner";

export function LoginPage() {
	const { verified } = useSearch({ from: "/login" });
	const loginMutation = useLogin();

	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: "", password: "" },
	});

	const isLoading = loginMutation.isPending || form.formState.isSubmitting;

	const apiErrorMessage = loginMutation.error
		? isApiError(loginMutation.error)
			? loginMutation.error.message
			: "Sign in failed. Check your credentials and try again."
		: null;

	function onSubmit(values: LoginFormValues) {
		loginMutation.mutate(values);
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
						// ACCESS_PORTAL
					</span>
					<h1 className="font-headline m-0 text-(--on-surface)">
						Enter Credentials
					</h1>
				</header>

				{verified && (
					<SuccessBanner message="Email verified successfully. You can now sign in." />
				)}

				{apiErrorMessage && <AuthErrorBanner message={apiErrorMessage} />}

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						noValidate
						className="flex flex-col gap-6"
						aria-label="Sign in to PostBoard"
					>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem className="flex flex-col gap-2">
									<FormLabel className="mono-label uppercase text-(--dim)">
										Email Address
									</FormLabel>
									<FormControl>
										<Input
											{...field}
											type="email"
											placeholder="name@company.com"
											autoComplete="email"
											autoCapitalize="none"
											spellCheck={false}
										/>
									</FormControl>
									<FormMessage className="font-sans text-[12px] leading-[1.4] text-(--error)" />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem className="flex flex-col gap-2">
									<div className="flex items-center justify-between">
										<FormLabel className="mono-label uppercase text-(--dim)">
											Password
										</FormLabel>
										<Link
											to="/forgot-password"
											className="mono-label text-(--dim) no-underline transition-colors duration-150 hover:text-(--primary-container) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary-container)"
										>
											FORGOT?
										</Link>
									</div>
									<PasswordField
										label=""
										name={field.name}
										value={field.value}
										onChange={field.onChange}
										onBlur={field.onBlur}
										error={form.formState.errors.password}
										autoComplete="current-password"
										placeholder="••••••••"
									/>
								</FormItem>
							)}
						/>

						<AuthSubmitButton label="Sign In" isLoading={isLoading} />
					</form>
				</Form>

				<div className="flex flex-col gap-2">
					<p className="m-0 font-sans text-[14px] text-(--body)">
						No access credentials?
					</p>
					<Link
						to="/register"
						className="inline-flex items-center gap-2 text-(--on-surface) no-underline transition-colors duration-150 hover:text-(--primary-container) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary-container)"
					>
						<HugeiconsIcon
							icon={UserMultiple02Icon}
							strokeWidth={2}
							className="h-3.5 w-3.5"
							aria-hidden="true"
						/>
						<span className="mono-label uppercase tracking-[0.05em]">
							REGISTER NEW INDUSTRIAL ACCOUNT
						</span>
					</Link>
				</div>

				<footer className="flex items-center justify-between border-t border-(--rule) pt-6">
					<span className="mono-label text-(--dim)">© 2024 PB_IND</span>
					<div className="flex items-center gap-6">
						<span className="mono-label text-(--dim)">V0.9.1-BETA</span>
						<span className="mono-label text-(--dim)">US-EAST-1</span>
					</div>
				</footer>
			</div>
		</AuthLayout>
	);
}
