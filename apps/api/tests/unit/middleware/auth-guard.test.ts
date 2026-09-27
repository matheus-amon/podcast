/**
 * Auth Guard Middleware Tests
 *
 * Exercises authGuardMiddleware() end to end: a real Elysia app, real requests,
 * real JWTs. The previous auth-guard.test.ts only covered signAccessToken and
 * verifyToken from the JWT library, so the middleware itself was never run —
 * which is how a guard that could never populate `ctx.user` shipped.
 */

import { describe, it, expect } from 'bun:test';
import { Elysia } from 'elysia';
import { authGuardMiddleware } from '../../../src/middleware/auth-guard';
import { signAccessToken } from '../../../src/lib/jwt';

/** A route shaped like auth.controller.ts, reading `user` off the context. */
function buildApp() {
  return new Elysia()
    .use(authGuardMiddleware())
    .get('/me', ({ user, set }) => {
      if (!user) {
        set.status = 401;
        return { error: { code: 'UNAUTHORIZED' } };
      }
      return { user: { userId: user.userId, email: user.email } };
    });
}

const USER = {
  userId: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
};

const url = 'http://localhost/me';

describe('authGuardMiddleware', () => {
  describe('rejection', () => {
    it('returns 401 TOKEN_MISSING when there is no Authorization header', async () => {
      const res = await buildApp().handle(new Request(url));

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({
        error: { code: 'TOKEN_MISSING', message: 'Authentication required' },
      });
    });

    it('returns 401 TOKEN_MISSING when the scheme is not Bearer', async () => {
      const res = await buildApp().handle(
        new Request(url, { headers: { authorization: 'Basic dXNlcjpwYXNz' } })
      );

      expect(res.status).toBe(401);
      expect((await res.json()).error.code).toBe('TOKEN_MISSING');
    });

    it('returns 401 TOKEN_INVALID for a malformed token', async () => {
      const res = await buildApp().handle(
        new Request(url, { headers: { authorization: 'Bearer nao-e-um-jwt' } })
      );

      expect(res.status).toBe(401);
      expect((await res.json()).error.code).toBe('TOKEN_INVALID');
    });

    it('returns 401 TOKEN_INVALID for a tampered token', async () => {
      const tampered = signAccessToken(USER) + 'tampered';

      const res = await buildApp().handle(
        new Request(url, { headers: { authorization: `Bearer ${tampered}` } })
      );

      expect(res.status).toBe(401);
      expect((await res.json()).error.code).toBe('TOKEN_INVALID');
    });
  });

  describe('context augmentation', () => {
    // This is the regression guard. `onBeforeHandle` does not merge its return
    // value into the handler context, and hooks default to `as: 'scoped'`, so
    // both mistakes produce the same symptom: the handler runs with
    // `ctx.user` undefined and answers 401 to a perfectly valid token.
    it('populates `user` on the context for a valid token', async () => {
      const res = await buildApp().handle(
        new Request(url, {
          headers: { authorization: `Bearer ${signAccessToken(USER)}` },
        })
      );

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ user: { userId: USER.userId, email: USER.email } });
    });

    it('lets the handler run rather than short-circuiting the response', async () => {
      const res = await buildApp().handle(
        new Request(url, {
          headers: { authorization: `Bearer ${signAccessToken(USER)}` },
        })
      );

      const body = await res.json();
      expect(body.error).toBeUndefined();
    });

    it('propagates to routes registered on a prefixed group, as index.ts does', async () => {
      // auth.controller.ts mounts inside .group('/api', ...) in src/index.ts.
      const app = new Elysia()
        .use(authGuardMiddleware())
        .group('/api', (api) =>
          api.get('/auth/me', ({ user, set }) => {
            if (!user) {
              set.status = 401;
              return { error: { code: 'UNAUTHORIZED' } };
            }
            return { user: { userId: user.userId, email: user.email } };
          })
        );

      const res = await app.handle(
        new Request('http://localhost/api/auth/me', {
          headers: { authorization: `Bearer ${signAccessToken(USER)}` },
        })
      );

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ user: { userId: USER.userId, email: USER.email } });
    });
  });
});
