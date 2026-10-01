/**
 * Rate Limiter Tests
 *
 * These drive the real Elysia plugin through app.handle(). An earlier version of
 * this file reimplemented the limiter's logic locally and asserted on that
 * copy, so it passed while src/middleware/rate-limit.ts sat at 21.95% line
 * coverage — the tests could not have caught a regression in it.
 */

import { describe, it, expect } from 'bun:test';
import { Elysia } from 'elysia';
import { rateLimiter, strictRateLimiter } from '../../../src/middleware/rate-limit';

interface RateLimitResponse {
  status: number;
  body: any;
}

/**
 * The limiter keys on x-forwarded-for and keeps a module-level store, so each
 * test uses its own IP to stay independent of the others.
 */
async function hit(ip: string, maxRequests: number, windowMs = 60_000): Promise<RateLimitResponse[]> {
  const app = new Elysia()
    .use(rateLimiter(maxRequests, windowMs))
    .get('/probe', () => ({ ok: true }));

  const responses: RateLimitResponse[] = [];
  for (let i = 0; i < maxRequests + 1; i++) {
    const res = await app.handle(
      new Request('http://localhost/probe', { headers: { 'x-forwarded-for': ip } }),
    );
    responses.push({ status: res.status, body: await res.json() });
  }
  return responses;
}

/** Reads one response by index, failing loudly if it is absent. */
function at(responses: RateLimitResponse[], index: number): RateLimitResponse {
  const response = responses[index];
  if (!response) {
    throw new Error(`no response recorded at index ${index}`);
  }
  return response;
}

describe('rateLimiter', () => {
  it('allows requests up to the limit and blocks the one past it', async () => {
    const responses = await hit('10.0.0.1', 3);

    expect(responses.slice(0, 3).map((r) => r.status)).toEqual([200, 200, 200]);
    expect(at(responses, 3).status).toBe(429);
  });

  it('returns RATE_LIMIT_EXCEEDED with a retryAfter in seconds', async () => {
    const responses = await hit('10.0.0.2', 1, 60_000);

    expect(at(responses, 1).status).toBe(429);
    expect(at(responses, 1).body.error.code).toBe('RATE_LIMIT_EXCEEDED');
    expect(at(responses, 1).body.error.retryAfter).toBeGreaterThan(0);
    expect(at(responses, 1).body.error.retryAfter).toBeLessThanOrEqual(60);
  });

  it('names the configured limit and window in the message', async () => {
    const responses = await hit('10.0.0.3', 2, 30_000);

    expect(at(responses, 2).body.error.message).toContain('Maximum 2 requests');
    expect(at(responses, 2).body.error.message).toContain('30 seconds');
  });

  it('counts each IP separately', async () => {
    const app = new Elysia()
      .use(rateLimiter(1))
      .get('/probe', () => ({ ok: true }));

    const first = await app.handle(
      new Request('http://localhost/probe', { headers: { 'x-forwarded-for': '1.1.1.1' } }),
    );
    const other = await app.handle(
      new Request('http://localhost/probe', { headers: { 'x-forwarded-for': '2.2.2.2' } }),
    );
    const blocked = await app.handle(
      new Request('http://localhost/probe', { headers: { 'x-forwarded-for': '1.1.1.1' } }),
    );

    expect(first.status).toBe(200);
    expect(other.status).toBe(200);
    expect(blocked.status).toBe(429);
  });

  it('treats a missing x-forwarded-for as a single shared bucket', async () => {
    const app = new Elysia()
      .use(rateLimiter(1))
      .get('/probe', () => ({ ok: true }));

    const first = await app.handle(new Request('http://localhost/probe'));
    const second = await app.handle(new Request('http://localhost/probe'));

    expect(first.status).toBe(200);
    expect(second.status).toBe(429);
  });

  it('starts a fresh window once the old one has elapsed', async () => {
    const app = new Elysia()
      .use(rateLimiter(1, 20))
      .get('/probe', () => ({ ok: true }));

    const send = () =>
      app.handle(
        new Request('http://localhost/probe', { headers: { 'x-forwarded-for': '10.0.0.4' } }),
      );

    const first = await send();
    const blocked = await send();

    // Wait past resetAt so the stored entry is treated as expired.
    await Bun.sleep(40);

    const afterWindow = await send();

    expect(first.status).toBe(200);
    expect(blocked.status).toBe(429);
    expect(afterWindow.status).toBe(200);
  });
});

describe('strictRateLimiter', () => {
  it('defaults to 10 attempts per minute', async () => {
    const app = new Elysia()
      .use(strictRateLimiter())
      .get('/probe', () => ({ ok: true }));

    const send = () =>
      app.handle(
        new Request('http://localhost/probe', { headers: { 'x-forwarded-for': '10.0.0.5' } }),
      );

    for (let i = 0; i < 10; i++) {
      expect((await send()).status).toBe(200);
    }
    expect((await send()).status).toBe(429);
  });

  it('honours an explicit override', async () => {
    const app = new Elysia()
      .use(strictRateLimiter(2))
      .get('/probe', () => ({ ok: true }));

    const send = () =>
      app.handle(
        new Request('http://localhost/probe', { headers: { 'x-forwarded-for': '10.0.0.6' } }),
      );

    expect((await send()).status).toBe(200);
    expect((await send()).status).toBe(200);
    expect((await send()).status).toBe(429);
  });
});