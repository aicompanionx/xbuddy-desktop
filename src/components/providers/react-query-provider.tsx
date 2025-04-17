import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const defaultOptions = {
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
}

export const createQueryClient = () => new QueryClient(defaultOptions)

export const ReactQueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queryClient] = useState(() => createQueryClient())

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
