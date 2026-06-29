import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { AuthInitializer } from "./AuthInitializer";
import { QueryProvider } from "./QueryProvider";
import { ThemeProvider } from "./ThemeProvider";

interface AppProviderProps {
	children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
	return (
		<ThemeProvider>
			<QueryProvider>
				<AuthInitializer>
					{children}
					<Toaster
						position="bottom-right"
						toastOptions={{
							style: {
								borderRadius: 0,
								border: "1px solid var(--rule)",
								background: "var(--surface-container-lowest)",
								color: "var(--on-surface)",
								fontSize: "13px",
							},
						}}
					/>
				</AuthInitializer>
			</QueryProvider>
		</ThemeProvider>
	);
}
