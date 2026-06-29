import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";

interface QueryProviderProps {
	children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 1000 * 60 * 5,
						gcTime: 1000 * 60 * 30,
						retry: 1,
						retryDelay: (attemptIndex) =>
							Math.min(1000 * 2 ** attemptIndex, 10_000),
						refetchOnWindowFocus: false,
						refetchOnReconnect: false,
					},
					mutations: {
						retry: 0,
					},
				},
			}),
	);

	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
}
