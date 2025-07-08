'use client'

import React, { useState } from 'react'
import { QueryClient, QueryClientProvider, type QueryClientConfig } from '@tanstack/react-query'

// Secure QueryClient configuration for financial applications
const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      // Security: Prevent stale data in financial contexts
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (previously cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on authentication errors
        if (error && typeof error === 'object' && 'response' in error) {
          const response = (error as { response?: { status?: number } }).response
          if (response?.status === 401 || response?.status === 403) {
            return false
          }
        }
        // Retry up to 3 times for other errors
        return failureCount < 3
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true, // Refetch when user returns to app
      refetchOnReconnect: true, // Refetch when network reconnects
    },
    mutations: {
      // Security: Don't retry mutations automatically
      retry: false,
      // Clear related queries on mutation success
      onError: (error) => {
        console.error('Mutation error:', error)
      },
    },
  },
}

interface QueryProviderProps {
  children: React.ReactNode
}

export function QueryProvider({ children }: QueryProviderProps): React.JSX.Element {
  // Create QueryClient instance only once per component lifecycle
  const [queryClient] = useState(() => new QueryClient(queryClientConfig))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}