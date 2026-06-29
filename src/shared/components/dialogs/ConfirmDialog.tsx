import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	confirmLabel?: string;
	onConfirm: () => void;
	isLoading?: boolean;
	variant?: "danger" | "default";
}

export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel = "Confirm",
	onConfirm,
	isLoading,
	variant = "default",
}: ConfirmDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="border-(--rule) bg-(--surface-container-lowest) text-(--on-surface)">
				<DialogHeader>
					<DialogTitle className="font-serif text-lg">{title}</DialogTitle>
					<DialogDescription className="font-sans text-[13px] text-(--dim)">
						{description}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="flex gap-2">
					<button
						type="button"
						onClick={() => onOpenChange(false)}
						className="border border-(--rule) px-4 py-2 font-sans text-[13px] text-(--on-surface) transition-colors hover:bg-(--surface-container-low)"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={onConfirm}
						disabled={isLoading}
						className={`border px-4 py-2 font-sans text-[13px] transition-colors disabled:opacity-50 ${
							variant === "danger"
								? "border-(--error) text-(--error) hover:bg-(--error)/10"
								: "border-(--primary) text-(--primary) hover:bg-(--primary)/10"
						}`}
					>
						{isLoading ? "Processing..." : confirmLabel}
					</button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
