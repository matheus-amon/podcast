import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

interface ProvidersProps {
  children: ReactNode
}

export function createWrapper() {
  const queryClient = createTestQueryClient()
  
  return function Wrapper({ children }: ProvidersProps) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

export { createTestQueryClient }
