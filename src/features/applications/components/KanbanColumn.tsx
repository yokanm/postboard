import type { ReactNode } from "react";
import type { ApplicationListItem } from "../types";
import { KanbanCard } from "./KanbanCard";

interface KanbanColumnProps {
	title: string;
	status: string;
	applications: ApplicationListItem[];
	count: number;
	onCardClick: (application: ApplicationListItem) => void;
	onDrop: (applicationId: string, newStatus: string) => void;
	children?: ReactNode;
}

export function KanbanColumn({
	title,
	status,
	applications,
	count,
	onCardClick,
	onDrop,
	children,
}: KanbanColumnProps) {
	function handleDragOver(e: React.DragEvent) {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
	}

	function handleDrop(e: React.DragEvent) {
		e.preventDefault();
		const applicationId = e.dataTransfer.getData("applicationId");
		if (applicationId) {
			onDrop(applicationId, status);
		}
	}

	return (
		<div
			className="flex min-w-[280px] max-w-[320px] flex-1 flex-col border border-(--rule)"
			onDragOver={handleDragOver}
			onDrop={handleDrop}
			aria-label={`${title} column`}
			role="region"
		>
			<div className="flex items-center justify-between border-b border-(--rule) bg-(--surface-container-low) px-3 py-2">
				<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--on-surface)">
					{title}
				</span>
				<span className="mono-label flex h-5 w-5 items-center justify-center rounded-[2px] bg-(--surface-container-high) text-[10px] text-(--dim)">
					{count}
				</span>
			</div>
			<div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
				{applications.map((app) => (
					<KanbanCard key={app.id} application={app} onClick={onCardClick} />
				))}
				{applications.length === 0 && (
					<div className="flex flex-1 items-center justify-center p-4">
						<span className="mono-label text-[10px] uppercase tracking-[0.05em] text-(--dim)">
							No candidates
						</span>
					</div>
				)}
				{children}
			</div>
		</div>
	);
}
