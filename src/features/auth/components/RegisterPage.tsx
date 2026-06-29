import { zodResolver } from "@hookform/resolvers/zod";
import { NoteIcon, UserSearch01Icon } from "@hugeicons/core-free-icons";
import { Link } from "@tanstack/react-router";
import { Controller, useForm } from "react-hook-form";

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
import { useRegister } from "../hooks";
import { AuthLayout } from "../layout/AuthLayout";
import { type RegisterFormValues, registerSchema } from "../schemas";
import type { UserRole } from "../types";
import { AuthErrorBanner } from "./AuthErrorBanner";
import { AuthSubmitButton } from "./AuthSubmitButton";
import { RoleCard } from "./RoleCard";

export function RegisterPage() {
	const registerMutation = useRegister();

	const form = useForm<RegisterFormValues>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			userName: "",
			email: "",
			password: "",
			confirmPassword: "",
			role: "CANDIDATE",
			companyId: "",
		},
	});

	const selectedRole = form.watch("role");
	const passwordValue = form.watch("password");
	const isLoading = registerMutation.isPending || form.formState.isSubmitting;

	const apiErrorMessage = registerMutation.error
		? isApiError(registerMutation.error)
			? registerMutation.error.message
			: "Registration failed. Please try again."
		: null;

	function onSubmit(values: RegisterFormValues) {
		const { confirmPassword, companyId, ...rest } = values;
		registerMutation.mutate(
			values.role === "RECRUITER" && companyId?.trim()
				? { ...rest, companyId: companyId.trim(), role: "RECRUITER" }
				: { ...rest, role: "CANDIDATE" },
		);
	}

	return (
		<AuthLayout>
			<div className="flex w-full max-w-[460px] flex-col gap-5">
				<div className="mb-1 flex flex-col lg:hidden">
					<span className="font-[20px] font-black tracking-[-0.02em] uppercase text-(--on-surface) font-serif">
						POSTBOARD
					</span>
				</div>

				<header className="flex flex-col gap-1.5">
					<span className="mono-label text-(--dim)">// REGISTER_NEW_USER</span>
					<h1 className="font-headline m-0 text-(--on-surface)">
						Initialize Account
					</h1>
					<p className="font-body m-0 text-(--body)">
						Enter your credentials to access the broadsheet network.
					</p>
				</header>

				{apiErrorMessage && <AuthErrorBanner message={apiErrorMessage} />}

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						noValidate
						className="flex flex-col gap-4"
						aria-label="Create a PostBoard account"
					>
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="firstName"
								render={({ field }) => (
									<FormItem className="flex flex-col gap-1.5">
										<FormLabel className="mono-label uppercase text-(--dim)">
											First Name
										</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="text"
												placeholder="Erik"
												autoComplete="given-name"
												autoCapitalize="words"
											/>
										</FormControl>
										<FormMessage className="font-sans text-[12px] leading-[1.4] text-(--error)" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="lastName"
								render={({ field }) => (
									<FormItem className="flex flex-col gap-1.5">
										<FormLabel className="mono-label uppercase text-(--dim)">
											Last Name
										</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="text"
												placeholder="Larsson"
												autoComplete="family-name"
												autoCapitalize="words"
											/>
										</FormControl>
										<FormMessage className="font-sans text-[12px] leading-[1.4] text-(--error)" />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="userName"
							render={({ field }) => (
								<FormItem className="flex flex-col gap-1.5">
									<FormLabel className="mono-label uppercase text-(--dim)">
										Username
									</FormLabel>
									<FormControl>
										<Input
											{...field}
											type="text"
											placeholder="e.larsson"
											autoComplete="username"
											autoCapitalize="none"
										/>
									</FormControl>
									<FormMessage className="font-sans text-[12px] leading-[1.4] text-(--error)" />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem className="flex flex-col gap-1.5">
									<FormLabel className="mono-label uppercase text-(--dim)">
										Email Address
									</FormLabel>
									<FormControl>
										<Input
											{...field}
											type="email"
											placeholder="e.larsson@postboard.ind"
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
								<FormItem className="flex flex-col gap-1.5">
									<FormLabel className="mono-label uppercase text-(--dim)">
										Password
									</FormLabel>
									<PasswordField
										label=""
										name={field.name}
										value={field.value}
										onChange={field.onChange}
										onBlur={field.onBlur}
										error={form.formState.errors.password}
										autoComplete="new-password"
										placeholder="••••••••••••"
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
								<FormItem className="flex flex-col gap-1.5">
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
										placeholder="••••••••••••"
										showConfirmMatch
										confirmValue={passwordValue}
									/>
								</FormItem>
							)}
						/>

						<div
							className="flex flex-col gap-3"
							role="radiogroup"
							aria-label="Select your operational role"
						>
							<span className="mono-label block uppercase text-(--dim)">
								Operational Role
							</span>
							{form.formState.errors.role && (
								<p
									role="alert"
									className="font-sans text-[12px] leading-[1.4] text-(--error)"
								>
									{form.formState.errors.role.message}
								</p>
							)}
							<Controller
								name="role"
								control={form.control}
								render={({ field }) => (
									<div className="grid grid-cols-2 gap-px border border-(--rule) bg-(--rule)">
										<RoleCard
											value="CANDIDATE"
											label="Candidate"
											sublabel="Find Placement"
											icon={UserSearch01Icon}
											isSelected={field.value === "CANDIDATE"}
											onSelect={(role: UserRole) => field.onChange(role)}
										/>
										<RoleCard
											value="RECRUITER"
											label="Recruiter"
											sublabel="Manage Pipeline"
											icon={NoteIcon}
											isSelected={field.value === "RECRUITER"}
											onSelect={(role: UserRole) => field.onChange(role)}
										/>
									</div>
								)}
							/>
						</div>

						{selectedRole === "RECRUITER" && (
							<FormField
								control={form.control}
								name="companyId"
								render={({ field }) => (
									<FormItem className="flex flex-col gap-1.5">
										<FormLabel className="mono-label uppercase text-(--dim)">
											Company ID
										</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="text"
												placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
												autoComplete="off"
											/>
										</FormControl>
										<FormMessage className="font-sans text-[12px] leading-[1.4] text-(--error)" />
									</FormItem>
								)}
							/>
						)}

						<AuthSubmitButton label="CREATE ACCOUNT" isLoading={isLoading} />
					</form>
				</Form>

				<div>
					<p className="m-0 font-sans text-[13px] text-(--body)">
						Already have an account?{" "}
						<Link
							to="/login"
							className="font-semibold text-(--primary-container) no-underline transition-colors duration-150 hover:text-(--primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary-container)"
						>
							Login
						</Link>
					</p>
				</div>

				<footer className="flex items-center justify-between border-t border-(--rule) pt-5">
					<span className="mono-label text-(--dim)">
						© 2024 POSTBOARD INDUSTRIAL
					</span>
					<div className="flex items-center gap-6">
						<span className="mono-label text-(--dim)">LEGAL</span>
						<span className="mono-label text-(--dim)">STATUS</span>
					</div>
				</footer>
			</div>
		</AuthLayout>
	);
}
