import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface WithdrawConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	isPending: boolean;
	jobTitle: string;
}

export function WithdrawConfirmDialog({
	open,
	onOpenChange,
	onConfirm,
	isPending,
	jobTitle,
}: WithdrawConfirmDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-[400px] rounded-none border-(--rule) bg-(--surface) p-0">
				<DialogHeader className="border-b border-(--rule) px-5 py-4">
					<DialogTitle className="font-sans text-[15px] font-semibold text-(--on-surface)">
						Withdraw Application
					</DialogTitle>
				</DialogHeader>
				<div className="flex flex-col gap-4 px-5 py-4">
					<DialogDescription className="m-0 font-sans text-[14px] text-(--body)">
						Are you sure you want to withdraw your application for{" "}
						<span className="font-medium text-(--on-surface)">{jobTitle}</span>?
						This action cannot be undone.
					</DialogDescription>
				</div>
				<DialogFooter className="border-t border-(--rule) px-5 py-4">
					<div className="flex w-full justify-end gap-3">
						<button
							type="button"
							onClick={() => onOpenChange(false)}
							className="mono-label cursor-pointer border border-(--rule) bg-transparent px-4 py-2 uppercase tracking-[0.05em] text-(--dim) transition-colors duration-150 hover:border-(--on-surface) hover:text-(--on-surface)"
						>
							Cancel
						</button>
						<button
							type="button"
							onClick={onConfirm}
							disabled={isPending}
							className="mono-label cursor-pointer border border-(--error) bg-(--error) px-4 py-2 uppercase tracking-[0.05em] text-(--on-error) transition-colors duration-150 hover:opacity-90 disabled:opacity-50"
						>
							{isPending ? "WITHDRAWING..." : "WITHDRAW"}
						</button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
