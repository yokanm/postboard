import { cn } from "@/lib/utils";
import { getApplicationStatusConfig } from "../utils/application-status";

interface ApplicationStatusBadgeProps {
	status: string;
	className?: string;
}

export function ApplicationStatusBadge({
	status,
	className,
}: ApplicationStatusBadgeProps) {
	const config = getApplicationStatusConfig(status);

	return (
		<span
			className={cn(
				"mono-label inline-block rounded-[2px] px-2 py-0.5 text-[11px] uppercase tracking-[0.05em]",
				config.color,
				config.bg,
				config.border,
				className,
			)}
		>
			{config.label}
		</span>
	);
}
