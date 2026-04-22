import { QueryClient } from '@tanstack/react-query';

// Shared QueryClient singleton. Matches the defaults the demo used (5-min
// staleTime, single retry) so cached state feels the same across both apps.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
