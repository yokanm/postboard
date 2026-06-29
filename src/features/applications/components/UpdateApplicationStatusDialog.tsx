import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { ApplicationStatus } from "../types";
import {
	getApplicationStatusConfig,
	getValidTransitions,
} from "../utils/application-status";

interface UpdateApplicationStatusDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	currentStatus: ApplicationStatus;
	candidateName: string;
	onConfirm: (status: ApplicationStatus, rejectionReason?: string) => void;
	isPending: boolean;
}

export function UpdateApplicationStatusDialog({
	open,
	onOpenChange,
	currentStatus,
	candidateName,
	onConfirm,
	isPending,
}: UpdateApplicationStatusDialogProps) {
	const transitions = getValidTransitions(currentStatus);
	const [selectedStatus, setSelectedStatus] =
		useState<ApplicationStatus | null>(null);
	const [rejectionReason, setRejectionReason] = useState("");

	function handleConfirm() {
		if (!selectedStatus) return;
		onConfirm(
			selectedStatus,
			selectedStatus === "REJECTED" ? rejectionReason || undefined : undefined,
		);
	}

	function handleOpenChange(open: boolean) {
		if (!open) {
			setSelectedStatus(null);
			setRejectionReason("");
		}
		onOpenChange(open);
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="max-w-[420px] rounded-none border-(--rule) bg-(--surface) p-0">
				<DialogHeader className="border-b border-(--rule) px-5 py-4">
					<DialogTitle className="font-sans text-[15px] font-semibold text-(--on-surface)">
						Update Status — {candidateName}
					</DialogTitle>
				</DialogHeader>
				<div className="flex flex-col gap-4 px-5 py-4">
					<div className="flex flex-col gap-2">
						<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
							Current: {getApplicationStatusConfig(currentStatus).label}
						</span>
					</div>

					{transitions.length === 0 ? (
						<p className="m-0 font-sans text-[14px] text-(--body)">
							No further status changes are available for this application.
						</p>
					) : (
						<div className="flex flex-col gap-2">
							<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
								Move to:
							</span>
							<div className="flex flex-wrap gap-2">
								{transitions.map((status) => {
									const config = getApplicationStatusConfig(status);
									return (
										<button
											key={status}
											type="button"
											onClick={() => setSelectedStatus(status)}
											className={`mono-label cursor-pointer rounded-[2px] border px-3 py-1.5 text-[11px] uppercase tracking-[0.05em] transition-colors duration-150 ${
												selectedStatus === status
													? `${config.color} ${config.bg} border-(--primary-container)`
													: "border-(--rule) text-(--dim) hover:border-(--on-surface) hover:text-(--on-surface)"
											}`}
										>
											{config.label}
										</button>
									);
								})}
							</div>
						</div>
					)}

					{selectedStatus === "REJECTED" && (
						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="rejection-reason"
								className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)"
							>
								Rejection reason (optional)
							</label>
							<textarea
								id="rejection-reason"
								value={rejectionReason}
								onChange={(e) => setRejectionReason(e.target.value)}
								maxLength={1000}
								rows={3}
								className="w-full border border-(--rule) bg-(--background) px-3 py-2 font-sans text-[13px] text-(--on-surface) placeholder:text-(--muted) focus:border-(--primary-container) focus:outline-none resize-none"
								placeholder="Provide feedback to the candidate..."
							/>
						</div>
					)}
				</div>
				<DialogFooter className="border-t border-(--rule) px-5 py-4">
					<div className="flex w-full justify-end gap-3">
						<button
							type="button"
							onClick={() => handleOpenChange(false)}
							className="mono-label cursor-pointer border border-(--rule) bg-transparent px-4 py-2 uppercase tracking-[0.05em] text-(--dim) transition-colors duration-150 hover:border-(--on-surface) hover:text-(--on-surface)"
						>
							Cancel
						</button>
						<button
							type="button"
							onClick={handleConfirm}
							disabled={!selectedStatus || isPending}
							className="mono-label cursor-pointer border border-(--primary-container) bg-(--primary-container) px-4 py-2 uppercase tracking-[0.05em] text-(--on-primary-container) transition-colors duration-150 hover:bg-(--primary) disabled:opacity-50"
						>
							{isPending ? "UPDATING..." : "UPDATE"}
						</button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
