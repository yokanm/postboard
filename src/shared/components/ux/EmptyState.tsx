interface EmptyStateAction {
	label: string;
	onClick: () => void;
	variant?: "ghost" | "filled" | "text";
}

interface EmptyStateProps {
	title: string;
	description?: string;
	action?: EmptyStateAction;
	variant?: "default" | "error";
	highlightTile?: number;
}

function PressGridIllustration({
	highlightTile = 0,
	isError = false,
}: {
	highlightTile?: number;
	isError?: boolean;
}) {
	const tiles = Array.from({ length: 6 }, (_, i) => i);
	const borderColor = isError ? "var(--destructive)" : "var(--press-amber)";

	return (
		<div className="mb-6 grid h-16 w-24 grid-cols-3 grid-rows-2 gap-[2px]">
			{tiles.map((i) => (
				<div
					key={i}
					className="bg-[#131313] transition-all duration-200 hover:border-[var(--press-amber)] hover:bg-[linear-gradient(135deg,rgba(232,97,10,0.1),transparent)]"
					style={{
						border: `1px solid ${i === highlightTile ? borderColor : "var(--rule)"}`,
					}}
				/>
			))}
		</div>
	);
}

export function EmptyState({
	title,
	description,
	action,
	variant = "default",
	highlightTile = 0,
}: EmptyStateProps) {
	const isError = variant === "error";
	const hoverBorder = isError
		? "hover:border-(--destructive)"
		: "hover:border-(--press-amber)";

	return (
		<div
			className={`flex flex-col items-center border border-(--rule) bg-[#0F0F0F] p-8 text-center transition-colors ${hoverBorder}`}
		>
			<PressGridIllustration highlightTile={highlightTile} isError={isError} />
			<h3 className="font-ui-lg mb-2 text-(--on-surface)">{title}</h3>
			{description && (
				<p className="mb-6 font-body text-[15px] leading-relaxed text-(--dim)">
					{description}
				</p>
			)}
			{action && (
				<button
					type="button"
					onClick={action.onClick}
					className={`w-full px-6 py-3 mono-label uppercase transition-colors ${
						action.variant === "filled"
							? "bg-(--press-amber) text-[#080808] hover:bg-(--primary-container)"
							: action.variant === "text"
								? "border-transparent bg-transparent text-(--body) hover:text-white"
								: "border border-(--rule) bg-transparent text-[#F0EDE6] hover:border-[#F0EDE6]"
					}`}
				>
					{action.label}
				</button>
			)}
		</div>
	);
}
