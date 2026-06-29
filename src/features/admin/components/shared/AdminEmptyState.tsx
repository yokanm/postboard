interface AdminEmptyStateProps {
	title: string;
	description?: string;
	icon?: React.ReactNode;
}

export function AdminEmptyState({
	title,
	description,
	icon,
}: AdminEmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center py-16 text-center">
			{icon && <div className="mb-4 text-(--dim)">{icon}</div>}
			<h3 className="font-serif text-lg text-(--on-surface)">{title}</h3>
			{description && (
				<p className="mt-1 max-w-sm font-sans text-[13px] text-(--dim)">
					{description}
				</p>
			)}
		</div>
	);
}
