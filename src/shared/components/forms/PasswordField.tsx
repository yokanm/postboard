import {
	Alert02Icon,
	LockPasswordIcon,
	Tick01Icon,
	ViewIcon,
	ViewOffIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useId, useRef, useState } from "react";
import type { FieldError } from "react-hook-form";
import { cn } from "#/lib/utils.ts";
import {
	getPasswordRequirements,
	getPasswordStrength,
} from "@/shared/utils/password";

interface PasswordFieldProps {
	label: string;
	name?: string;
	value?: unknown;
	onChange?: (...args: unknown[]) => void;
	onBlur?: (...args: unknown[]) => void;
	error?: FieldError;
	autoComplete?: string;
	placeholder?: string;
	showStrength?: boolean;
	showRequirements?: boolean;
	showConfirmMatch?: boolean;
	confirmValue?: string;
	disabled?: boolean;
}

export function PasswordField({
	label,
	name,
	value = "",
	onChange,
	onBlur,
	error,
	autoComplete = "new-password",
	placeholder = "••••••••",
	showStrength = false,
	showRequirements = false,
	showConfirmMatch = false,
	confirmValue = "",
	disabled = false,
}: PasswordFieldProps) {
	const [visible, setVisible] = useState(false);
	const [capsLock, setCapsLock] = useState(false);
	const [focused, setFocused] = useState(false);
	const id = useId();
	const inputRef = useRef<HTMLInputElement | null>(null);

	const strValue = String(value ?? "");
	const strength = getPasswordStrength(strValue);
	const requirements = getPasswordRequirements(strValue);
	const passwordsMatch = strValue === confirmValue && confirmValue.length > 0;

	const strengthColor =
		strength.score < 20
			? "var(--destructive)"
			: strength.score < 40
				? "var(--error)"
				: strength.score < 55
					? "var(--warning)"
					: strength.score < 70
						? "var(--live)"
						: strength.score < 90
							? "var(--primary)"
							: "var(--primary-container)";

	const capsLockDetected = focused && capsLock;

	function onKeydown(e: React.KeyboardEvent) {
		if (e.getModifierState) {
			setCapsLock(e.getModifierState("CapsLock"));
		}
	}

	function handleFocus() {
		setFocused(true);
	}

	function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
		setFocused(false);
		setCapsLock(false);
		onBlur?.(e);
	}

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		onChange?.(e);
	}

	return (
		<div className="flex flex-col gap-1.5">
			{label && (
				<label
					htmlFor={id}
					className="mono-label uppercase text-(--dim) text-[11px]"
				>
					{label}
				</label>
			)}

			<div className="relative">
				<input
					name={name}
					value={value as string}
					onChange={handleChange}
					onBlur={handleBlur}
					ref={inputRef}
					id={id}
					type={visible ? "text" : "password"}
					autoComplete={autoComplete}
					placeholder={placeholder}
					disabled={disabled}
					aria-invalid={!!error}
					aria-describedby={error ? `${id}-error` : `${id}-desc`}
					onKeyDown={onKeydown}
					onFocus={handleFocus}
					spellCheck={false}
					autoCapitalize="none"
					className={cn(
						"h-9 w-full min-w-0 border px-3 py-1 pr-10 text-[13px] text-(--on-surface) transition-[color,box-shadow] outline-none selection:bg-(--primary-container) selection:text-(--on-primary-container) placeholder:text-(--muted) disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
						"focus-visible:border-(--primary-container) focus-visible:ring-[3px] focus-visible:ring-(--primary-container)",
						"aria-invalid:border-(--destructive) aria-invalid:ring-(--destructive)/20",
					)}
				/>

				<button
					type="button"
					onClick={() => {
						setVisible((v) => !v);
						inputRef.current?.focus();
					}}
					className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center p-1 text-(--dim) hover:text-(--on-surface) transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary-container)"
					aria-label={visible ? "Hide password" : "Show password"}
					tabIndex={-1}
				>
					<HugeiconsIcon
						icon={visible ? ViewOffIcon : ViewIcon}
						strokeWidth={2}
						className="h-4 w-4"
						aria-hidden="true"
					/>
				</button>
			</div>

			{capsLockDetected && (
				<p
					className="flex items-center gap-1 font-sans text-[11px] text-(--warning)"
					role="alert"
				>
					<HugeiconsIcon
						icon={Alert02Icon}
						strokeWidth={2}
						className="h-3 w-3"
						aria-hidden="true"
					/>
					Caps Lock is on
				</p>
			)}

			{error?.message && (
				<p
					id={`${id}-error`}
					role="alert"
					className="font-sans text-[12px] leading-[1.4] text-(--error)"
				>
					{error.message}
				</p>
			)}

			{showConfirmMatch && confirmValue.length > 0 && strValue.length > 0 && (
				<p
					className={`flex items-center gap-1 font-sans text-[12px] ${passwordsMatch ? "text-(--live)" : "text-(--error)"}`}
				>
					<HugeiconsIcon
						icon={passwordsMatch ? Tick01Icon : Alert02Icon}
						strokeWidth={2}
						className="h-3.5 w-3.5"
						aria-hidden="true"
					/>
					{passwordsMatch ? "Passwords match" : "Passwords do not match"}
				</p>
			)}

			{showStrength && strValue.length > 0 && (
				<div className="flex flex-col gap-1" id={`${id}-desc`}>
					<div
						className="h-1 w-full bg-(--surface-container-low) overflow-hidden"
						role="progressbar"
						aria-valuenow={strength.score}
						aria-valuemin={0}
						aria-valuemax={100}
						aria-label={`Password strength: ${strength.label}`}
					>
						<div
							className="h-full transition-all duration-300 ease-out"
							style={{
								width: `${strength.percent}%`,
								backgroundColor: strengthColor,
							}}
						/>
					</div>
					<div className="flex items-center gap-1">
						<HugeiconsIcon
							icon={LockPasswordIcon}
							strokeWidth={2}
							className="h-3 w-3"
							style={{ color: strengthColor }}
							aria-hidden="true"
						/>
						<span
							className="font-sans text-[11px]"
							style={{ color: strengthColor }}
						>
							{strength.label}
						</span>
					</div>
				</div>
			)}

			{showRequirements && strValue.length > 0 && (
				<ul
					className="flex flex-col gap-0.5 m-0 p-0 list-none"
					aria-label="Password requirements"
				>
					{requirements.map((req) => (
						<li
							key={req.label}
							className={`flex items-center gap-1.5 font-sans text-[11px] ${req.met ? "text-(--live)" : "text-(--muted)"}`}
						>
							<HugeiconsIcon
								icon={req.met ? Tick01Icon : Alert02Icon}
								strokeWidth={2}
								className="h-3 w-3 shrink-0"
								aria-hidden="true"
							/>
							{req.label}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
