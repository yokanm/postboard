import { LaptopIcon, MoonIcon, Sun01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { type ThemeMode, useThemeStore } from "@/stores/theme-store";

const modes: { value: ThemeMode; label: string; icon: typeof Sun01Icon }[] = [
	{ value: "light", label: "Light", icon: Sun01Icon },
	{ value: "dark", label: "Dark", icon: MoonIcon },
	{ value: "system", label: "System", icon: LaptopIcon },
];

export function ThemeToggle() {
	const theme = useThemeStore((s) => s.theme);
	const setTheme = useThemeStore((s) => s.setTheme);

	return (
		<div className="flex items-center border border-(--rule) overflow-hidden">
			{modes.map((m) => (
				<button
					key={m.value}
					type="button"
					onClick={() => setTheme(m.value)}
					aria-label={`Switch to ${m.label} mode`}
					aria-pressed={theme === m.value}
					className={`flex items-center justify-center px-2.5 py-1.5 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-(--primary-container) ${
						theme === m.value
							? "bg-(--primary-container) text-(--on-primary-container)"
							: "bg-(--surface) text-(--dim) hover:text-(--on-surface) hover:bg-(--surface-container-low)"
					}`}
				>
					<HugeiconsIcon
						icon={m.icon}
						strokeWidth={2}
						className="h-4 w-4"
						aria-hidden="true"
					/>
				</button>
			))}
		</div>
	);
}
