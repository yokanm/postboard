import { ArrowRight01Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface AuthSubmitButtonProps {
	label: string;
	isLoading: boolean;
	disabled?: boolean;
}

export function AuthSubmitButton({
	label,
	isLoading,
	disabled,
}: AuthSubmitButtonProps) {
	return (
		<button
			type="submit"
			disabled={isLoading || disabled}
			aria-busy={isLoading}
			className="flex w-full items-center justify-center gap-2.5 border-none bg-(--primary-container) px-6 py-3.5 font-sans text-[15px] font-semibold leading-none uppercase tracking-[0.04em] text-(--on-primary-container) outline-none transition-all duration-150 hover:bg-(--press-amber) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary) disabled:cursor-not-allowed disabled:opacity-50"
		>
			{isLoading ? (
				<>
					<HugeiconsIcon
						icon={Loading03Icon}
						strokeWidth={2}
						className="h-[18px] w-[18px] animate-spin"
						aria-hidden="true"
					/>
					<span>Processing...</span>
				</>
			) : (
				<>
					<span>{label}</span>
					<HugeiconsIcon
						icon={ArrowRight01Icon}
						strokeWidth={2.5}
						className="h-[18px] w-[18px]"
						aria-hidden="true"
					/>
				</>
			)}
		</button>
	);
}
