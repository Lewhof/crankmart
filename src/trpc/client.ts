import { createTRPCClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@/server/routers/_app'

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3010/api/trpc',
    }),
  ],
})
