import type { ApplicationListItem } from "../types";

interface KanbanCardProps {
	application: ApplicationListItem;
	onClick: (application: ApplicationListItem) => void;
	isDraggable?: boolean;
}

export function KanbanCard({
	application,
	onClick,
	isDraggable = true,
}: KanbanCardProps) {
	const name = `${application.user.firstName} ${application.user.lastName}`;
	const date = new Date(application.createdAt).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});

	return (
		<div
			className="border border-(--rule) bg-(--surface-container-low) p-3 transition-colors duration-150 hover:bg-(--surface-container) cursor-pointer"
			role="button"
			tabIndex={0}
			onClick={() => onClick(application)}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onClick(application);
				}
			}}
			draggable={isDraggable}
			onDragStart={(e) => {
				e.dataTransfer.setData("applicationId", application.id);
				e.dataTransfer.effectAllowed = "move";
			}}
			aria-label={`${name} - ${application.status}`}
		>
			<div className="flex flex-col gap-2">
				<div className="flex items-start justify-between gap-2">
					<span className="font-sans text-[13px] font-medium text-(--on-surface) truncate">
						{name}
					</span>
				</div>
				<p className="m-0 truncate font-sans text-[12px] text-(--body)">
					{application.user.email}
				</p>
				{application.user.profile?.skills &&
					application.user.profile.skills.length > 0 && (
						<div className="flex flex-wrap gap-1">
							{application.user.profile.skills.slice(0, 3).map((skill) => (
								<span
									key={skill}
									className="mono-label rounded-[2px] bg-(--surface-container-high) px-1.5 py-0.5 text-[10px] text-(--body)"
								>
									{skill}
								</span>
							))}
							{application.user.profile.skills.length > 3 && (
								<span className="mono-label text-[10px] text-(--dim)">
									+{application.user.profile.skills.length - 3}
								</span>
							)}
						</div>
					)}
				<span className="mono-label text-[10px] text-(--dim)">{date}</span>
			</div>
		</div>
	);
}
