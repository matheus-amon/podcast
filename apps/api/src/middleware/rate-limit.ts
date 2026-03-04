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

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5; // 5 requests per minute

export function rateLimiter(maxRequests: number = MAX_REQUESTS) {
  return new Elysia({
    name: 'rate-limiter',
  })
    .onRequest(({ request, set }) => {
      const ip = request.headers.get('x-forwarded-for') || 'unknown';
      const now = Date.now();

      if (!store[ip]) {
        store[ip] = {
          count: 1,
          resetAt: now + WINDOW_MS,
        };
        return;
      }

      if (now > store[ip].resetAt) {
        store[ip] = {
          count: 1,
          resetAt: now + WINDOW_MS,
        };
        return;
      }

      if (store[ip].count >= maxRequests) {
        set.status = 429;
        return {
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Too many requests. Maximum ${maxRequests} requests per ${WINDOW_MS / 1000} seconds.`,
            retryAfter: Math.ceil((store[ip].resetAt - now) / 1000),
          },
        };
      }

      store[ip].count++;
    });
}
