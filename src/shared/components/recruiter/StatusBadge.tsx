import type { JobStatus } from "@/features/jobs/types";

interface StatusBadgeProps {
	status: JobStatus | string;
}

const STATUS_STYLES: Record<
	string,
	{ bg: string; text: string; border?: string }
> = {
	OPEN: { bg: "bg-(--live)/10", text: "text-(--live)" },
	DRAFT: {
		bg: "bg-(--surface-container-high)",
		text: "text-(--dim)",
		border: "border border-dashed border-(--rule)",
	},
	CLOSED: { bg: "bg-(--surface-container-high)", text: "text-(--body)" },
	EXPIRED: { bg: "bg-(--surface-container-high)", text: "text-(--dim)" },
	PENDING: { bg: "bg-(--amber)/10", text: "text-(--amber)" },
	REVIEWED: {
		bg: "bg-(--primary-container)/10",
		text: "text-(--primary-container)",
	},
	SHORTLISTED: { bg: "bg-(--purple)/10", text: "text-(--purple)" },
	REJECTED: { bg: "bg-(--error)/10", text: "text-(--error)" },
	ACCEPTED: { bg: "bg-(--green)/10", text: "text-(--green)" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
	const style = STATUS_STYLES[status] ?? {
		bg: "bg-(--surface-container-high)",
		text: "text-(--dim)",
	};
	return (
		<span
			className={`mono-label inline-block rounded-[2px] px-2 py-0.5 text-[11px] uppercase tracking-[0.05em] ${style.bg} ${style.text} ${style.border ?? ""}`}
		>
			{status === "ACCEPTED" ? "HIRED" : status}
		</span>
	);
}
