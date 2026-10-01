/**
 * Authentication E2E Tests
 *
 * End-to-end tests for authentication flow
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import jwt from 'jsonwebtoken';
import type { AuthResponse } from '../../src/types/auth';

/** GET /api/auth/me returns the token payload, keyed by userId. */
interface MeResponse {
  user: { userId: string; email: string };
}

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3001';

/**
 * Response.json() is typed as `unknown`; these tests read fields off it.
 * Annotate the call site rather than casting at every access.
 */
async function readJson<T>(res: Response): Promise<T> {
  return (await res.json()) as T;
}

/**
 * Every request here comes from 127.0.0.1 with no proxy in front of it, so
 * without this header all of them share the rate limiter's single 'unknown'
 * bucket and the suite trips its own 10-per-minute auth limit partway through.
 * A unique IP per request is what a real fleet of clients looks like to the
 * limiter. Rate limiting itself is covered in tests/unit/middleware.
 */
let ipCounter = 0;
function nextIp(): string {
  return `203.0.${Math.floor(ipCounter / 256)}.${ipCounter++}`;
}

async function api(
  path: string,
  init: { method?: string; body?: unknown; headers?: Record<string, string> } = {},
): Promise<Response> {
  const headers: Record<string, string> = {
    'x-forwarded-for': nextIp(),
    ...init.headers,
  };
  if (init.body !== undefined) headers['Content-Type'] = 'application/json';

  return fetch(`${BASE_URL}${path}`, {
    method: init.method ?? 'GET',
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
}

// E2E needs a running API + seeded DB (see README). Skipped by default so
// `bun test` stays green; run with RUN_E2E=1 TEST_API_URL=http://localhost:3001
// after `docker compose up` + `bun run src/index.ts`.
const runE2E = process.env.RUN_E2E === '1';
describe.skipIf(!runE2E)('Authentication E2E', () => {
  describe('POST /api/auth/register', () => {
    const testUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'SecureP@ss123',
      name: 'E2E Test User',
    };

    it('should register user successfully', async () => {
      const response = await api('/api/auth/register', { method: 'POST', body: testUser });

      expect(response.status).toBe(200);

      const data = await readJson<AuthResponse>(response);

      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(testUser.email);
      expect(data.user.name).toBe(testUser.name);
      expect(data.user.isActive).toBe(true);
      expect(data.accessToken).toBeDefined();
      expect(data.refreshToken).toBeDefined();
    });

    it('should return 400 for invalid email', async () => {
      const response = await api('/api/auth/register', {
        method: 'POST',
        body: { email: 'invalid-email', password: testUser.password, name: testUser.name },
      });

      expect(response.status).toBe(400);
    });

    it('should return 400 for weak password', async () => {
      const response = await api('/api/auth/register', {
        method: 'POST',
        body: { email: `weak-${Date.now()}@example.com`, password: 'weak', name: testUser.name },
      });

      expect(response.status).toBe(400);
    });

    it('should return 400 for missing name', async () => {
      const response = await api('/api/auth/register', {
        method: 'POST',
        body: { email: `noname-${Date.now()}@example.com`, password: testUser.password, name: '' },
      });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken: string;
    let accessToken: string;
    let userId: string;

    beforeEach(async () => {
      // Register a test user and get tokens
      const testEmail = `test-refresh-${Date.now()}-${ipCounter}@example.com`;
      const registerResponse = await api('/api/auth/register', {
        method: 'POST',
        body: { email: testEmail, password: 'SecureP@ss123', name: 'Refresh Test User' },
      });

      expect(registerResponse.status).toBe(200);
      const data = await readJson<AuthResponse>(registerResponse);
      refreshToken = data.refreshToken;
      accessToken = data.accessToken;
      userId = data.user.id;
    });

    it('should refresh tokens successfully', async () => {
      const response = await api('/api/auth/refresh', {
        method: 'POST',
        body: { refreshToken },
      });

      expect(response.status).toBe(200);

      const data = await readJson<AuthResponse>(response);
      expect(data.accessToken).toBeDefined();
      expect(data.refreshToken).toBeDefined();
      expect(data.refreshToken).not.toBe(refreshToken);
    });

    it('should return 400 for missing refresh token', async () => {
      const response = await api('/api/auth/refresh', { method: 'POST', body: {} });

      expect(response.status).toBe(400);
    });

    it('should return 401 for invalid refresh token', async () => {
      const response = await api('/api/auth/refresh', {
        method: 'POST',
        body: { refreshToken: 'invalid-token' },
      });

      expect(response.status).toBe(401);
    });

    it('should return 401 for expired refresh token', async () => {
      // A correctly signed token that expired an hour ago. Signed with the same
      // secret the server uses, so the only reason the server rejects it is
      // expiry — which is what this test is about. (The previous version used a
      // hardcoded token signed by nobody, so it was really testing signature
      // rejection under the name of expiry.)
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT_SECRET must be set for e2e; it must match the server process');
      }

      const expiredToken = jwt.sign(
        { userId, email: 'test@example.com', type: 'refresh' },
        secret,
        { expiresIn: -3600 },
      );

      const response = await api('/api/auth/refresh', {
        method: 'POST',
        body: { refreshToken: expiredToken },
      });

      expect(response.status).toBe(401);
    });

    it('should allow accessing protected route with new access token', async () => {
      const refreshResponse = await api('/api/auth/refresh', {
        method: 'POST',
        body: { refreshToken },
      });

      const { accessToken: newAccessToken } = await readJson<AuthResponse>(refreshResponse);

      const meResponse = await api('/api/auth/me', {
        headers: { Authorization: `Bearer ${newAccessToken}` },
      });

      expect(meResponse.status).toBe(200);
      const data = await readJson<MeResponse>(meResponse);
      expect(data.user).toBeDefined();
    });
  });

  describe('Session Persistence', () => {
    let refreshToken: string;
    let accessToken: string;

    beforeEach(async () => {
      // Register a test user and get tokens
      const testEmail = `test-session-${Date.now()}-${ipCounter}@example.com`;
      const registerResponse = await api('/api/auth/register', {
        method: 'POST',
        body: { email: testEmail, password: 'SecureP@ss123', name: 'Session Test User' },
      });

      expect(registerResponse.status).toBe(200);
      const data = await readJson<AuthResponse>(registerResponse);
      refreshToken = data.refreshToken;
      accessToken = data.accessToken;
    });

    it('should maintain session after token refresh', async () => {
      const initialMeResponse = await api('/api/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      expect(initialMeResponse.status).toBe(200);
      const initialData = await readJson<MeResponse>(initialMeResponse);

      const refreshResponse = await api('/api/auth/refresh', {
        method: 'POST',
        body: { refreshToken },
      });

      const { accessToken: newAccessToken } = await readJson<AuthResponse>(refreshResponse);

      const newMeResponse = await api('/api/auth/me', {
        headers: { Authorization: `Bearer ${newAccessToken}` },
      });

      expect(newMeResponse.status).toBe(200);
      const newData = await readJson<MeResponse>(newMeResponse);

      expect(newData.user.userId).toBe(initialData.user.userId);
      expect(newData.user.email).toBe(initialData.user.email);
    });

    it('should invalidate old refresh token after refresh', async () => {
      const refreshResponse1 = await api('/api/auth/refresh', {
        method: 'POST',
        body: { refreshToken },
      });

      expect(refreshResponse1.status).toBe(200);
      const { refreshToken: newRefreshToken } = await readJson<AuthResponse>(refreshResponse1);

      // Try to use old refresh token again
      const refreshResponse2 = await api('/api/auth/refresh', {
        method: 'POST',
        body: { refreshToken },
      });

      expect(refreshResponse2.status).toBe(401);

      // But new token should work
      const refreshResponse3 = await api('/api/auth/refresh', {
        method: 'POST',
        body: { refreshToken: newRefreshToken },
      });

      expect(refreshResponse3.status).toBe(200);
    });
  });
});
