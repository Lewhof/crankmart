import { initTRPC, TRPCError } from '@trpc/server'
import { auth } from '@/auth'

type CreateContextOptions = Record<string, never>

export const createContextInner = async (_opts: CreateContextOptions) => {
  const session = await auth()
  return {
    session,
  }
}

export const createContext = async () => {
  return createContextInner({})
}

type Context = Awaited<ReturnType<typeof createContext>>

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape }) {
    return shape
  },
})

export const router = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  })
})
