import { Alert02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface AuthErrorBannerProps {
	message: string;
}

export function AuthErrorBanner({ message }: AuthErrorBannerProps) {
	return (
		<div
			role="alert"
			className="flex items-start gap-2.5 border border-(--destructive) border-l-3 border-l-(--destructive) bg-(--error-container) px-4 py-3"
			aria-live="assertive"
		>
			<HugeiconsIcon
				icon={Alert02Icon}
				strokeWidth={2}
				className="mt-0.5 h-4 w-4 flex-shrink-0 text-(--error)"
				aria-hidden="true"
			/>
			<span className="font-body text-[13px] leading-[1.5] text-(--on-error-container)">
				{message}
			</span>
		</div>
	);
}
