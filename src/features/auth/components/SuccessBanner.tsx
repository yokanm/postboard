import { Tick01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface SuccessBannerProps {
	message: string;
}

export function SuccessBanner({ message }: SuccessBannerProps) {
	return (
		<output className="flex items-start gap-2.5 border border-(--live) border-l-3 border-l-(--live) bg-(--live-dim) px-4 py-3">
			<HugeiconsIcon
				icon={Tick01Icon}
				strokeWidth={2}
				className="mt-0.5 h-4 w-4 flex-shrink-0 text-(--live)"
				aria-hidden="true"
			/>
			<span className="font-body text-[13px] leading-[1.5] text-(--on-error-container)">
				{message}
			</span>
		</output>
	);
}
