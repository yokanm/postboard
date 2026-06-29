import {
	Shield01Icon,
	ShieldIcon,
	TimeQuarterIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ComponentProps } from "react";

type VerificationStatus = "VERIFIED" | "PENDING" | "NONE";

interface VerificationBadgeProps {
	status: VerificationStatus;
	size?: "sm" | "md" | "lg";
}

const statusConfig: Record<
	VerificationStatus,
	{
		icon: ComponentProps<typeof HugeiconsIcon>["icon"];
		label: string;
		containerClass: string;
		dotClass?: string;
	}
> = {
	VERIFIED: {
		icon: Shield01Icon,
		label: "VERIFIED",
		containerClass: "border-(--live)/30 text-(--live)",
	},
	PENDING: {
		icon: TimeQuarterIcon,
		label: "PENDING",
		containerClass:
			"border-(--primary-container)/30 text-(--primary-container)",
		dotClass: "bg-(--primary-container) animate-pulse",
	},
	NONE: {
		icon: ShieldIcon,
		label: "NOT VERIFIED",
		containerClass: "border-(--muted) text-(--muted)",
	},
};

const sizeClasses = {
	sm: "text-[9px] px-1.5 py-0.5 gap-1",
	md: "text-[11px] px-2 py-1 gap-1.5",
	lg: "text-[13px] px-3 py-1.5 gap-2",
};

export function VerificationBadge({
	status,
	size = "md",
}: VerificationBadgeProps) {
	const config = statusConfig[status];

	if (status === "NONE") return null;

	return (
		<output
			className={`mono-label inline-flex items-center border uppercase tracking-[0.05em] ${statusConfig[status].containerClass} ${sizeClasses[size]}`}
			aria-label={`Company ${config.label.toLowerCase()}`}
		>
			{config.dotClass && (
				<span
					className={`h-1.5 w-1.5 shrink-0 rounded-full ${config.dotClass}`}
					aria-hidden="true"
				/>
			)}
			<HugeiconsIcon
				icon={config.icon}
				strokeWidth={2}
				className="h-3.5 w-3.5"
				aria-hidden="true"
			/>
			{config.label}
		</output>
	);
}
