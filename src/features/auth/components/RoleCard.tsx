import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import type { UserRole } from "../types";

interface RoleCardProps {
	value: UserRole;
	label: string;
	sublabel: string;
	icon: IconSvgElement;
	isSelected: boolean;
	onSelect: (role: UserRole) => void;
}

export function RoleCard({
	value,
	label,
	sublabel,
	icon,
	isSelected,
	onSelect,
}: RoleCardProps) {
	return (
		<label
			className={cn(
				"flex cursor-pointer flex-col gap-1.5 bg-[var(--surface-container-lowest)] p-4 outline-none transition-colors duration-150",
				"hover:bg-[var(--surface-container-low)]",
				"focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--primary-container)]",
				isSelected
					? "border-2 border-[var(--primary)] bg-[var(--surface-container-low)]"
					: "border-2 border-transparent",
			)}
		>
			<input
				type="radio"
				className="sr-only"
				checked={isSelected}
				onChange={() => onSelect(value)}
			/>
			<HugeiconsIcon
				icon={icon}
				strokeWidth={isSelected ? 2 : 1.5}
				className="h-5 w-5 text-[var(--primary-container)]"
				aria-hidden="true"
			/>
			<span className="font-[15px] font-semibold leading-[1.3] text-[var(--on-surface)]">
				{label}
			</span>
			<span className="mono-label block uppercase text-[var(--dim)]">
				{sublabel}
			</span>
		</label>
	);
}
