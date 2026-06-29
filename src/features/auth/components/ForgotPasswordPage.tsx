import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
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
import { isApiRequestError } from "@/lib/api/client";
import { useForgotPassword } from "../hooks";
import { AuthLayout } from "../layout/AuthLayout";
import {
	type ForgotPasswordFormValues,
	forgotPasswordSchema,
} from "../schemas";
import { AuthErrorBanner } from "./AuthErrorBanner";
import { AuthSubmitButton } from "./AuthSubmitButton";
import { SuccessBanner } from "./SuccessBanner";

export function ForgotPasswordPage() {
	const forgotMutation = useForgotPassword();

	const form = useForm<ForgotPasswordFormValues>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: { email: "" },
	});

	const isLoading = forgotMutation.isPending || form.formState.isSubmitting;

	const apiErrorMessage = forgotMutation.error
		? isApiRequestError(forgotMutation.error)
			? forgotMutation.error.message
			: "Request failed. Please try again."
		: null;

	const isSuccess = forgotMutation.isSuccess;

	function onSubmit(values: ForgotPasswordFormValues) {
		forgotMutation.mutate(values);
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
						// PASSWORD_RECOVERY
					</span>
					<h1 className="font-headline m-0 text-(--on-surface)">
						Reset Password
					</h1>
					<p className="font-body m-0 text-(--body)">
						Enter your registered email to receive a reset link.
					</p>
				</header>

				{apiErrorMessage && <AuthErrorBanner message={apiErrorMessage} />}

				{isSuccess ? (
					<SuccessBanner message="If an account exists with that email, you will receive a password reset link shortly." />
				) : (
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							noValidate
							className="flex flex-col gap-6"
							aria-label="Request password reset"
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

							<AuthSubmitButton label="SEND RESET LINK" isLoading={isLoading} />
						</form>
					</Form>
				)}

				<Link
					to="/login"
					className="inline-flex items-center gap-2 text-(--dim) no-underline transition-colors duration-150 hover:text-(--on-surface) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary-container)"
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
