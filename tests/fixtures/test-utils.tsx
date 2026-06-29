import type { ReactElement } from "react"
import { render, type RenderOptions } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })
}

interface WrapperOptions {
  queryClient?: QueryClient
}

function createWrapper(options: WrapperOptions = {}) {
  const queryClient = options.queryClient ?? createTestQueryClient()

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

export function renderWithProviders(
  ui: ReactElement,
  options?: RenderOptions & WrapperOptions
) {
  const { queryClient, ...renderOptions } = options ?? {}
  const wrapper = createWrapper({ queryClient })

  return {
    ...render(ui, { wrapper, ...renderOptions }),
    queryClient: queryClient ?? createTestQueryClient(),
  }
}

export { createTestQueryClient }
