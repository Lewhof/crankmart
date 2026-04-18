import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import type { NextRequest } from 'next/server'

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url:   process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

function make(limit: number, windowSeconds: number, prefix: string): Ratelimit | null {
  if (!redis) return null
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
    analytics: false,
    prefix: `cm:rl:${prefix}`,
  })
}

export const limiters = {
  authWrite: make(10, 60, 'auth-write'),
  authRead:  make(30, 60, 'auth-read'),
  listingsWrite: make(20, 300, 'listings-write'),
  messagesStart: make(30, 60, 'messages-start'),
  reports:    make(10, 300, 'reports'),
  waitlist:   make(5, 60, 'waitlist'),
  publicApi:  make(120, 60, 'public-api'),
  stolenCheck:  make(10, 3600, 'stolen-check'),   // 10 / IP / hour
  stolenReport: make(5, 86400, 'stolen-report'),  // 5 / user / day
  // Community
  commentWrite: make(15, 300, 'comment-write'),   // 15 / user / 5 min
  reactionToggle: make(60, 60, 'reaction-toggle'), // 60 / user / min — generous, idempotent
  flagSubmit:   make(5, 3600, 'flag-submit'),     // 5 / user / hour
  lostReport:   make(3, 86400, 'lost-report'),    // 3 / user / day
  profileWrite: make(10, 3600, 'profile-write'),  // 10 / user / hour
}

export function clientKey(request: NextRequest, suffix = ''): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown'
  return suffix ? `${ip}:${suffix}` : ip
}

export interface RateLimitResult {
  ok: boolean
  limit?: number
  remaining?: number
  reset?: number
}

export async function check(
  limiter: Ratelimit | null,
  key: string,
): Promise<RateLimitResult> {
  if (!limiter) return { ok: true }
  try {
    const res = await limiter.limit(key)
    return {
      ok:        res.success,
      limit:     res.limit,
      remaining: res.remaining,
      reset:     res.reset,
    }
  } catch {
    return { ok: true }
  }
}

export function rateLimitHeaders(r: RateLimitResult): Record<string, string> {
  const h: Record<string, string> = {}
  if (r.limit !== undefined)     h['X-RateLimit-Limit']     = String(r.limit)
  if (r.remaining !== undefined) h['X-RateLimit-Remaining'] = String(r.remaining)
  if (r.reset !== undefined)     h['X-RateLimit-Reset']     = String(r.reset)
  return h
}
