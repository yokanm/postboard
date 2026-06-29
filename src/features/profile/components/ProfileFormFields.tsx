import { useFormContext } from "react-hook-form";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import type { ProfileFormValues } from "../schemas";

export function ProfileFormFields() {
	const form = useFormContext<ProfileFormValues>();

	return (
		<div className="flex flex-col gap-4">
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<FormField
					control={form.control}
					name="firstName"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
								First Name
							</FormLabel>
							<FormControl>
								<input
									{...field}
									className="w-full border border-(--rule) bg-(--surface-container-low) px-3 py-2 font-sans text-[15px] text-(--on-surface) outline-none placeholder:text-(--dim) focus:border-(--primary)"
								/>
							</FormControl>
							<FormMessage className="font-sans text-[12px] text-(--error)" />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="lastName"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
								Last Name
							</FormLabel>
							<FormControl>
								<input
									{...field}
									className="w-full border border-(--rule) bg-(--surface-container-low) px-3 py-2 font-sans text-[15px] text-(--on-surface) outline-none placeholder:text-(--dim) focus:border-(--primary)"
								/>
							</FormControl>
							<FormMessage className="font-sans text-[12px] text-(--error)" />
						</FormItem>
					)}
				/>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<FormField
					control={form.control}
					name="location"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
								Location
							</FormLabel>
							<FormControl>
								<input
									{...field}
									placeholder="e.g. San Francisco, CA"
									className="w-full border border-(--rule) bg-(--surface-container-low) px-3 py-2 font-sans text-[15px] text-(--on-surface) outline-none placeholder:text-(--dim) focus:border-(--primary)"
								/>
							</FormControl>
							<FormMessage className="font-sans text-[12px] text-(--error)" />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="phone"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
								Phone
							</FormLabel>
							<FormControl>
								<input
									{...field}
									placeholder="+1 (555) 123-4567"
									className="w-full border border-(--rule) bg-(--surface-container-low) px-3 py-2 font-sans text-[15px] text-(--on-surface) outline-none placeholder:text-(--dim) focus:border-(--primary)"
								/>
							</FormControl>
							<FormMessage className="font-sans text-[12px] text-(--error)" />
						</FormItem>
					)}
				/>
			</div>

			<FormField
				control={form.control}
				name="bio"
				render={({ field }) => (
					<FormItem>
						<FormLabel className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
							Bio
						</FormLabel>
						<FormControl>
							<textarea
								{...field}
								rows={3}
								placeholder="Tell us about yourself..."
								className="w-full resize-none border border-(--rule) bg-(--surface-container-low) px-3 py-2 font-sans text-[15px] text-(--on-surface) outline-none placeholder:text-(--dim) focus:border-(--primary)"
							/>
						</FormControl>
						<FormMessage className="font-sans text-[12px] text-(--error)" />
					</FormItem>
				)}
			/>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<FormField
					control={form.control}
					name="linkedinUrl"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
								LinkedIn URL
							</FormLabel>
							<FormControl>
								<input
									{...field}
									placeholder="https://linkedin.com/in/..."
									className="w-full border border-(--rule) bg-(--surface-container-low) px-3 py-2 font-sans text-[15px] text-(--on-surface) outline-none placeholder:text-(--dim) focus:border-(--primary)"
								/>
							</FormControl>
							<FormMessage className="font-sans text-[12px] text-(--error)" />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="githubUrl"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
								GitHub URL
							</FormLabel>
							<FormControl>
								<input
									{...field}
									placeholder="https://github.com/..."
									className="w-full border border-(--rule) bg-(--surface-container-low) px-3 py-2 font-sans text-[15px] text-(--on-surface) outline-none placeholder:text-(--dim) focus:border-(--primary)"
								/>
							</FormControl>
							<FormMessage className="font-sans text-[12px] text-(--error)" />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="websiteUrl"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
								Website
							</FormLabel>
							<FormControl>
								<input
									{...field}
									placeholder="https://example.com"
									className="w-full border border-(--rule) bg-(--surface-container-low) px-3 py-2 font-sans text-[15px] text-(--on-surface) outline-none placeholder:text-(--dim) focus:border-(--primary)"
								/>
							</FormControl>
							<FormMessage className="font-sans text-[12px] text-(--error)" />
						</FormItem>
					)}
				/>
			</div>
		</div>
	);
}
