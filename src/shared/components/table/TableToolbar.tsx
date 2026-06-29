import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface TableToolbarProps {
	searchValue: string;
	onSearchChange: (value: string) => void;
	searchPlaceholder?: string;
	children?: React.ReactNode;
}

export function TableToolbar({
	searchValue,
	onSearchChange,
	searchPlaceholder = "Search...",
	children,
}: TableToolbarProps) {
	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div className="relative w-full sm:max-w-xs">
				<HugeiconsIcon
					icon={Search01Icon}
					strokeWidth={2}
					className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--muted)"
					aria-hidden="true"
				/>
				<input
					type="text"
					value={searchValue}
					onChange={(e) => onSearchChange(e.target.value)}
					placeholder={searchPlaceholder}
					className="h-9 w-full border border-(--rule) bg-(--background) pl-9 pr-3 font-sans text-[13px] text-(--on-surface) outline-none placeholder:text-(--muted) focus-visible:border-(--primary-container) focus-visible:ring-[3px] focus-visible:ring-(--primary-container)"
					aria-label={searchPlaceholder}
				/>
			</div>
			{children && <div className="flex items-center gap-2">{children}</div>}
		</div>
	);
}
