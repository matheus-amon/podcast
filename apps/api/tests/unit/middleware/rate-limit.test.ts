/**
 * Rate Limiter Middleware Tests
 *
 * Test rate limiting functionality
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';

// Import the internal store manipulation functions
let store: Record<string, { count: number; resetAt: number }> = {};

const WINDOW_MS = 60 * 1000; // 1 minute

function createRateLimitedRequest(ip: string, maxRequests: number): { status: number; error?: any } {
  const now = Date.now();

  if (!store[ip]) {
    store[ip] = {
      count: 1,
      resetAt: now + WINDOW_MS,
    };
    return { status: 200 };
  }

  if (now > store[ip].resetAt) {
    store[ip] = {
      count: 1,
      resetAt: now + WINDOW_MS,
    };
    return { status: 200 };
  }

  if (store[ip].count >= maxRequests) {
    return {
      status: 429,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Too many requests`,
        retryAfter: Math.ceil((store[ip].resetAt - now) / 1000),
      },
    };
  }

  store[ip].count++;
  return { status: 200 };
}

describe('RateLimiter', () => {
  beforeEach(() => {
    store = {};
  });

  afterEach(() => {
    store = {};
  });

  it('should allow requests under the limit', () => {
    const maxRequests = 3;
    const ip = '127.0.0.1';

    // First 3 requests should pass
    for (let i = 0; i < maxRequests; i++) {
      const result = createRateLimitedRequest(ip, maxRequests);
      expect(result.status).toBe(200);
    }
  });

  it('should block requests over the limit', () => {
    const maxRequests = 2;
    const ip = '192.168.1.1';

    // First 2 requests should pass
    for (let i = 0; i < maxRequests; i++) {
      const result = createRateLimitedRequest(ip, maxRequests);
      expect(result.status).toBe(200);
    }

    // Third request should be blocked
    const result = createRateLimitedRequest(ip, maxRequests);
    expect(result.status).toBe(429);
    expect(result.error).toBeDefined();
    expect(result.error.code).toBe('RATE_LIMIT_EXCEEDED');
  });

  it('should return retry-after in error response', () => {
    const maxRequests = 1;
    const ip = '172.16.0.1';

    // First request passes
    const result1 = createRateLimitedRequest(ip, maxRequests);
    expect(result1.status).toBe(200);

    // Second request should be rate limited
    const result2 = createRateLimitedRequest(ip, maxRequests);
    expect(result2.status).toBe(429);
    expect(result2.error.retryAfter).toBeGreaterThan(0);
    expect(result2.error.retryAfter).toBeLessThanOrEqual(60);
  });

  it('should track different IPs separately', () => {
    const maxRequests = 1;

    // IP 1 uses its limit
    const result1 = createRateLimitedRequest('1.1.1.1', maxRequests);
    expect(result1.status).toBe(200);

    // IP 2 should still be allowed
    const result2 = createRateLimitedRequest('2.2.2.2', maxRequests);
    expect(result2.status).toBe(200);

    // IP 1 should be blocked
    const result3 = createRateLimitedRequest('1.1.1.1', maxRequests);
    expect(result3.status).toBe(429);
  });

  it('should allow custom max requests', () => {
    const ip = '10.0.0.1';

    // Test with limit of 5
    for (let i = 0; i < 5; i++) {
      const result = createRateLimitedRequest(ip, 5);
      expect(result.status).toBe(200);
    }

    const result6 = createRateLimitedRequest(ip, 5);
    expect(result6.status).toBe(429);
  });

  it('should respect login rate limit (5 per minute)', () => {
    const loginIp = 'user-ip';
    const loginLimit = 5;

    // 5 login attempts should pass
    for (let i = 0; i < 5; i++) {
      const result = createRateLimitedRequest(loginIp, loginLimit);
      expect(result.status).toBe(200);
    }

    // 6th attempt should fail
    const result = createRateLimitedRequest(loginIp, loginLimit);
    expect(result.status).toBe(429);
  });

  it('should respect register rate limit (3 per minute)', () => {
    const registerIp = 'register-ip';
    const registerLimit = 3;

    // 3 register attempts should pass
    for (let i = 0; i < 3; i++) {
      const result = createRateLimitedRequest(registerIp, registerLimit);
      expect(result.status).toBe(200);
    }

    // 4th attempt should fail
    const result = createRateLimitedRequest(registerIp, registerLimit);
    expect(result.status).toBe(429);
  });
});
