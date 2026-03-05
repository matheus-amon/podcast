/**
 * Rate Limiter Middleware
 *
 * Limit requests per IP address
 */

import { Elysia, t } from 'elysia';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

const store: RateLimitStore = {};

// Default: 30 requests per minute (0.5 seconds between requests)
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 30; // 30 requests per minute

export function rateLimiter(maxRequests: number = MAX_REQUESTS, windowMs: number = WINDOW_MS) {
  return new Elysia({
    name: 'rate-limiter',
  })
    .onRequest(({ request, set }) => {
      const ip = request.headers.get('x-forwarded-for') || 'unknown';
      const now = Date.now();

      if (!store[ip]) {
        store[ip] = {
          count: 1,
          resetAt: now + windowMs,
        };
        return;
      }

      if (now > store[ip].resetAt) {
        store[ip] = {
          count: 1,
          resetAt: now + windowMs,
        };
        return;
      }

      if (store[ip].count >= maxRequests) {
        set.status = 429;
        return {
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Too many requests. Maximum ${maxRequests} requests per ${windowMs / 1000} seconds.`,
            retryAfter: Math.ceil((store[ip].resetAt - now) / 1000),
          },
        };
      }

      store[ip].count++;
    });
}

/**
 * Strict rate limiter for auth endpoints
 * Use this for login/register endpoints
 */
export function strictRateLimiter(maxRequests: number = 10, windowMs: number = 60 * 1000) {
  return rateLimiter(maxRequests, windowMs);
}
