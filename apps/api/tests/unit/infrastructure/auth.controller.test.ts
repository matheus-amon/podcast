/**
 * Auth Controller Tests
 *
 * These mount the real AuthController.routes on a real Elysia app, composed the
 * way src/index.ts composes it, and drive it with real requests. An earlier
 * version of this file asserted on a mock's own return value without ever
 * reaching the controller, so every route handler ran zero times.
 */

import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { Elysia } from 'elysia';
import { AuthController } from '../../../src/infrastructure/http/adapters/auth.controller';
import { errorMiddleware } from '../../../src/middleware/error.middleware';
import { signAccessToken } from '../../../src/lib/jwt';

const USER = {
  userId: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
};

const authUser = {
  id: 'user-id',
  email: USER.email,
  name: 'Test User',
  isActive: true,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

/** Response.json() is typed as `unknown`; these tests assert on its shape. */
async function body<T>(res: Response): Promise<T> {
  return (await res.json()) as T;
}

/**
 * The controllers mount rateLimiter(10), which keys a module-level store on
 * x-forwarded-for and falls back to a single shared 'unknown' bucket when the
 * header is absent. Twenty requests from one bucket would trip the real
 * limiter, so every request here gets its own IP.
 */
let ipCounter = 0;
function uniqueIp(): string {
  return `10.99.${Math.floor(ipCounter / 256)}.${ipCounter++}`;
}

/**
 * The composed app keeps a wide generic signature, so it is held as the return
 * type of a builder rather than as a bare `Elysia`: naming it `Elysia` makes
 * every hook on the instance fail to typecheck.
 */
function buildApp(controller: AuthController) {
  return new Elysia()
    .use(errorMiddleware)
    .group('/api', (api) => api.use(controller.routes));
}

function post(path: string, payload?: unknown, headers: Record<string, string> = {}) {
  return new Request(`http://localhost${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': uniqueIp(),
      ...headers,
    },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
}

describe('AuthController routes', () => {
  let registerUseCase: { execute: ReturnType<typeof mock> };
  let loginUseCase: { execute: ReturnType<typeof mock> };
  let logoutUseCase: { execute: ReturnType<typeof mock> };
  let refreshUseCase: { execute: ReturnType<typeof mock> };
  let app: ReturnType<typeof buildApp>;

  beforeEach(() => {
    registerUseCase = {
      execute: mock(() =>
        Promise.resolve({
          user: authUser,
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        }),
      ),
    };
    loginUseCase = {
      execute: mock(() =>
        Promise.resolve({
          user: authUser,
          accessToken: 'login-access-token',
          refreshToken: 'login-refresh-token',
        }),
      ),
    };
    logoutUseCase = { execute: mock(() => Promise.resolve({ success: true })) };
    refreshUseCase = {
      execute: mock(() =>
        Promise.resolve({ accessToken: 'new-access-token', refreshToken: 'new-refresh-token' }),
      ),
    };

    const controller = new AuthController(
      registerUseCase as any,
      loginUseCase as any,
      logoutUseCase as any,
      refreshUseCase as any,
    );

    // src/index.ts mounts the controllers inside .group('/api', …) and
    // registers errorMiddleware first. Both are needed for the paths and
    // statuses under test to be the ones the server actually serves:
    // errorMiddleware is what maps a VALIDATION error to 400, and without it
    // Elysia's default 422 is what these routes return.
    app = buildApp(controller);
  });

  describe('POST /api/auth/register', () => {
    it('returns the user and both tokens', async () => {
      const res = await app.handle(
        post('/api/auth/register', {
          email: 'test@example.com',
          password: 'SecureP@ss123',
          name: 'Test User',
        }),
      );

      expect(res.status).toBe(200);
      const data = await body<{ user: any; accessToken: string; refreshToken: string }>(res);
      expect(data.user.email).toBe('test@example.com');
      expect(data.accessToken).toBe('access-token');
      expect(data.refreshToken).toBe('refresh-token');
    });

    it('passes the validated body straight through to the use case', async () => {
      await app.handle(
        post('/api/auth/register', {
          email: 'test@example.com',
          password: 'SecureP@ss123',
          name: 'Test User',
        }),
      );

      expect(registerUseCase.execute).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'SecureP@ss123',
        name: 'Test User',
      });
    });

    it('rejects a malformed email before the use case runs', async () => {
      const res = await app.handle(
        post('/api/auth/register', {
          email: 'invalid-email',
          password: 'SecureP@ss123',
          name: 'Test User',
        }),
      );

      expect(res.status).toBe(400);
      expect(registerUseCase.execute).not.toHaveBeenCalled();
    });

    it('rejects a password shorter than 8 characters', async () => {
      const res = await app.handle(
        post('/api/auth/register', { email: 'test@example.com', password: 'weak', name: 'Test User' }),
      );

      expect(res.status).toBe(400);
      expect(registerUseCase.execute).not.toHaveBeenCalled();
    });

    it('rejects a name shorter than 2 characters', async () => {
      const res = await app.handle(
        post('/api/auth/register', { email: 'test@example.com', password: 'SecureP@ss123', name: '' }),
      );

      expect(res.status).toBe(400);
      expect(registerUseCase.execute).not.toHaveBeenCalled();
    });

    it('surfaces a duplicate email from the use case as a 500, not a 409', async () => {
      // The OpenAPI detail advertises 409 for this, but nothing maps the
      // use case's "Email already registered" error onto that status. This test
      // pins the actual behaviour so the gap is visible rather than assumed.
      registerUseCase.execute = mock(() => Promise.reject(new Error('Email already registered')));

      const res = await app.handle(
        post('/api/auth/register', {
          email: 'test@example.com',
          password: 'SecureP@ss123',
          name: 'Test User',
        }),
      );

      expect(res.status).not.toBe(409);
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/auth/login', () => {
    it('returns the user and both tokens', async () => {
      const res = await app.handle(
        post('/api/auth/login', { email: 'test@example.com', password: 'SecureP@ss123' }),
      );

      expect(res.status).toBe(200);
      const data = await body<{ accessToken: string; refreshToken: string }>(res);
      expect(data.accessToken).toBe('login-access-token');
      expect(data.refreshToken).toBe('login-refresh-token');
    });

    it('sends only email and password to the use case', async () => {
      await app.handle(
        post('/api/auth/login', { email: 'test@example.com', password: 'SecureP@ss123' }),
      );

      expect(loginUseCase.execute).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'SecureP@ss123',
      });
    });

    it('rejects a malformed email', async () => {
      const res = await app.handle(
        post('/api/auth/login', { email: 'invalid-email', password: 'SecureP@ss123' }),
      );

      expect(res.status).toBe(400);
      expect(loginUseCase.execute).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/logout', () => {
    it('revokes the token taken from the Authorization header', async () => {
      const res = await app.handle(post('/api/auth/logout', undefined, {
        authorization: 'Bearer header-refresh-token',
      }));

      expect(res.status).toBe(200);
      expect((await body<{ success: boolean }>(res)).success).toBe(true);
      expect(logoutUseCase.execute).toHaveBeenCalledWith({
        userId: 'anonymous',
        refreshToken: 'header-refresh-token',
      });
    });

    it('revokes the token taken from the cookie when there is no header', async () => {
      const res = await app.handle(
        post('/api/auth/logout', undefined, { cookie: 'refreshToken=cookie-refresh-token' }),
      );

      expect(res.status).toBe(200);
      expect(logoutUseCase.execute).toHaveBeenCalledWith({
        userId: 'anonymous',
        refreshToken: 'cookie-refresh-token',
      });
    });

    it('returns 400 when no token is supplied at all', async () => {
      const res = await app.handle(post('/api/auth/logout'));

      expect(res.status).toBe(400);
      expect((await body<any>(res)).error.code).toBe('BAD_REQUEST');
      expect(logoutUseCase.execute).not.toHaveBeenCalled();
    });

    it('returns 401 when the use case rejects the token', async () => {
      logoutUseCase.execute = mock(() => Promise.reject(new Error('Token not found')));

      const res = await app.handle(post('/api/auth/logout', undefined, {
        authorization: 'Bearer stale-refresh-token',
      }));

      expect(res.status).toBe(401);
      const data = await body<any>(res);
      expect(data.error.code).toBe('UNAUTHORIZED');
      expect(data.error.message).toBe('Token not found');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('returns the rotated token pair', async () => {
      const res = await app.handle(post('/api/auth/refresh', { refreshToken: 'old-refresh-token' }));

      expect(res.status).toBe(200);
      const data = await body<{ accessToken: string; refreshToken: string }>(res);
      expect(data.accessToken).toBe('new-access-token');
      expect(data.refreshToken).toBe('new-refresh-token');
    });

    it('passes the body token through to the use case', async () => {
      await app.handle(post('/api/auth/refresh', { refreshToken: 'old-refresh-token' }));

      expect(refreshUseCase.execute).toHaveBeenCalledWith({ refreshToken: 'old-refresh-token' });
    });

    it('returns 400 when refreshToken is missing', async () => {
      const res = await app.handle(post('/api/auth/refresh', {}));

      expect(res.status).toBe(400);
      expect(refreshUseCase.execute).not.toHaveBeenCalled();
    });

    it('returns 401 when the use case rejects the token', async () => {
      refreshUseCase.execute = mock(() => Promise.reject(new Error('Token expired')));

      const res = await app.handle(post('/api/auth/refresh', { refreshToken: 'expired' }));

      expect(res.status).toBe(401);
      const data = await body<any>(res);
      expect(data.error.code).toBe('UNAUTHORIZED');
      expect(data.error.message).toBe('Token expired');
    });
  });

  describe('GET /api/auth/me', () => {
    const get = (headers: Record<string, string> = {}) =>
      app.handle(
        new Request('http://localhost/api/auth/me', {
          headers: { 'x-forwarded-for': uniqueIp(), ...headers },
        }),
      );

    it('returns the authenticated user for a valid bearer token', async () => {
      const res = await get({ authorization: `Bearer ${signAccessToken(USER)}` });

      expect(res.status).toBe(200);
      expect(await body<any>(res)).toEqual({ user: USER });
    });

    it('returns 401 TOKEN_MISSING without an Authorization header', async () => {
      const res = await get();

      expect(res.status).toBe(401);
      expect((await body<any>(res)).error.code).toBe('TOKEN_MISSING');
    });

    it('returns 401 TOKEN_INVALID for a malformed token', async () => {
      const res = await get({ authorization: 'Bearer nao-e-um-jwt' });

      expect(res.status).toBe(401);
      expect((await body<any>(res)).error.code).toBe('TOKEN_INVALID');
    });
  });
});