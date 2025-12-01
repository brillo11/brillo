'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// betterAuth는 SessionProvider가 필요 없음
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
