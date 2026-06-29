interface AdminErrorStateProps {
	message: string;
	onRetry?: () => void;
}

export function AdminErrorState({ message, onRetry }: AdminErrorStateProps) {
	return (
		<div className="flex flex-col items-center justify-center py-16 text-center">
			<h3 className="font-serif text-lg text-(--error)">Failed to load</h3>
			<p className="mt-1 max-w-sm font-sans text-[13px] text-(--dim)">
				{message}
			</p>
			{onRetry && (
				<button
					type="button"
					onClick={onRetry}
					className="mt-4 border border-(--rule) px-4 py-2 font-sans text-[13px] text-(--on-surface) transition-colors hover:bg-(--surface-container-low)"
				>
					Retry
				</button>
			)}
		</div>
	);
}
