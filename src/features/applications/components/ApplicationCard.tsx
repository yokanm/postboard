import type { MyApplicationItem } from "../types";
import { ApplicationStatusBadge } from "./ApplicationStatusBadge";

interface ApplicationCardProps {
	application: MyApplicationItem;
	onWithdraw?: (id: string) => void;
	onClick?: (id: string) => void;
}

export function ApplicationCard({
	application,
	onWithdraw,
	onClick,
}: ApplicationCardProps) {
	const date = new Date(application.createdAt).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});

	return (
		<div
			className="border border-(--rule) bg-(--surface-container-low) transition-colors duration-150 hover:bg-(--surface-container)"
			role="button"
			tabIndex={0}
			onClick={() => onClick?.(application.id)}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onClick?.(application.id);
				}
			}}
			aria-label={`Application for ${application.job.title}`}
		>
			<div className="flex flex-col gap-3 p-4">
				<div className="flex items-start justify-between gap-4">
					<div className="flex min-w-0 flex-col gap-1">
						<h3 className="m-0 truncate font-sans text-[15px] font-semibold text-(--on-surface)">
							{application.job.title}
						</h3>
						<p className="m-0 truncate font-sans text-[13px] text-(--body)">
							{application.job.company.name}
						</p>
					</div>
					<ApplicationStatusBadge status={application.status} />
				</div>

				<div className="flex flex-wrap gap-x-4 gap-y-1">
					<span className="mono-label text-(--dim)">
						{application.job.locationType}
					</span>
					<span className="mono-label text-(--dim)">
						{application.job.experienceLevel}
					</span>
					<span className="mono-label text-(--dim)">Applied {date}</span>
				</div>

				{application.status === "PENDING" && onWithdraw && (
					<div className="flex justify-end">
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								onWithdraw(application.id);
							}}
							className="mono-label cursor-pointer bg-transparent px-2 py-1 text-[11px] uppercase tracking-[0.05em] text-(--error) transition-colors duration-150 hover:text-(--destructive)"
							aria-label={`Withdraw application for ${application.job.title}`}
						>
							Withdraw
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
