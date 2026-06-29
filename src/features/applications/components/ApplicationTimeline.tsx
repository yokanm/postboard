import { cn } from "@/lib/utils";
import {
	ALL_STATUSES,
	getApplicationStatusConfig,
} from "../utils/application-status";

interface ApplicationTimelineProps {
	currentStatus: string;
	className?: string;
}

export function ApplicationTimeline({
	currentStatus,
	className,
}: ApplicationTimelineProps) {
	const currentIndex = ALL_STATUSES.indexOf(
		currentStatus as (typeof ALL_STATUSES)[number],
	);

	return (
		<div
			className={cn("flex flex-col gap-0", className)}
			role="list"
			aria-label="Application status timeline"
		>
			{ALL_STATUSES.map((status, index) => {
				const config = getApplicationStatusConfig(status);
				const isCompleted = index <= currentIndex;
				const isCurrent = index === currentIndex;
				const isLast = index === ALL_STATUSES.length - 1;

				return (
					<div key={status} className="flex gap-3" role="listitem">
						<div className="flex flex-col items-center">
							<div
								className={cn(
									"h-3 w-3 rounded-full border-2",
									isCompleted
										? "border-(--primary-container) bg-(--primary-container)"
										: "border-(--rule) bg-(--surface-container-low)",
									isCurrent &&
										"ring-2 ring-(--primary-container) ring-offset-2 ring-offset-(--background)",
								)}
								aria-current={isCurrent ? "step" : undefined}
							/>
							{!isLast && (
								<div
									className={cn(
										"w-0.5 flex-1 min-h-[24px]",
										index < currentIndex
											? "bg-(--primary-container)"
											: "bg-(--rule)",
									)}
								/>
							)}
						</div>
						<div className={cn("pb-6", isLast && "pb-0")}>
							<span
								className={cn(
									"mono-label text-[11px] uppercase tracking-[0.05em]",
									isCompleted ? config.color : "text-(--dim)",
									isCurrent && "font-semibold",
								)}
							>
								{config.label}
							</span>
						</div>
					</div>
				);
			})}
		</div>
	);
}
