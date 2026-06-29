import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { type ThemeMode, useThemeStore } from "@/stores/theme-store";

interface ThemeContextValue {
	theme: ThemeMode;
	resolved: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextValue>({
	theme: "system",
	resolved: "dark",
});

export function useTheme() {
	return useContext(ThemeContext);
}

function getSystemPreference(): "light" | "dark" {
	if (typeof window === "undefined") return "dark";
	return window.matchMedia("(prefers-color-scheme: light)").matches
		? "light"
		: "dark";
}

interface ThemeProviderProps {
	children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
	const theme = useThemeStore((s) => s.theme);
	const [resolved, setResolved] = useState<"light" | "dark">(() => {
		if (theme !== "system") return theme;
		return getSystemPreference();
	});

	useEffect(() => {
		if (theme !== "system") {
			setResolved(theme);
			return;
		}

		const mq = window.matchMedia("(prefers-color-scheme: light)");
		const handler = () => setResolved(mq.matches ? "light" : "dark");
		handler();
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, [theme]);

	useEffect(() => {
		const root = document.documentElement;
		const current = root.className;
		const target = resolved === "dark" ? "dark" : "light";
		if (current !== target) {
			root.className = target;
		}
	}, [resolved]);

	return (
		<ThemeContext.Provider value={{ theme, resolved }}>
			{children}
		</ThemeContext.Provider>
	);
}
