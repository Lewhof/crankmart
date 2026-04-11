import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { db } from './db'
import { users } from './db/schema'
import { eq, sql as drizzleSql } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export const { auth, handlers, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: DrizzleAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1)

        if (!user || !user.passwordHash) return null

        const valid = await bcrypt.compare(credentials.password as string, user.passwordHash)
        if (!valid) return null

        return {
          id:       user.id,
          email:    user.email,
          name:     user.name,
          province: user.province,
          role:     user.role,
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error:  '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id       = user.id
        token.province = (user as any).province
        token.role     = (user as any).role
      }
      // For Google OAuth users, fetch role from DB if not yet in token
      if (!token.role && token.id) {
        try {
          const result = await db.execute(
            drizzleSql`SELECT role FROM users WHERE id = ${token.id as string} LIMIT 1`
          )
          const row = (result.rows ?? result)[0] as any
          if (row) token.role = row.role
        } catch {}
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id             = token.id as string
        ;(session.user as any).province = token.province
        ;(session.user as any).role     = token.role
      }
      return session
    },
  },
})
