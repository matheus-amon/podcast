/**
 * Auth Guard Middleware
 *
 * Protect routes that require authentication
 */

import { Elysia } from 'elysia';
import { verifyToken } from '../lib/jwt';

export function authGuardMiddleware() {
  return new Elysia({ name: 'auth-guard' })
    .onBeforeHandle(({ request, set }) => {
      const authHeader = request.headers.get('authorization');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        set.status = 401;
        return {
          error: {
            code: 'TOKEN_MISSING',
            message: 'Authentication required',
          },
        };
      }

      const token = authHeader.substring(7);
      const payload = verifyToken(token);

      if (!payload) {
        set.status = 401;
        return {
          error: {
            code: 'TOKEN_INVALID',
            message: 'Invalid or expired token',
          },
        };
      }

      // Return user context for downstream handlers
      return {
        user: payload,
      };
    });
}
