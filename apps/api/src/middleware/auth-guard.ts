/**
 * Auth Guard Middleware
 *
 * Protect routes that require authentication
 */

import { Elysia } from 'elysia';
import { verifyToken } from '../lib/jwt';

export function authGuardMiddleware() {
  return new Elysia({ name: 'auth-guard' })
    // `as: 'global'` is required. With the default 'scoped' the hooks are not
    // applied to the consuming app's routes, so the context augmented by
    // `resolve` below never reaches the handlers.
    .onBeforeHandle({ as: 'global' }, ({ request, status }) => {
      const authHeader = request.headers.get('authorization');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return status(401, {
          error: {
            code: 'TOKEN_MISSING',
            message: 'Authentication required',
          },
        });
      }

      if (!verifyToken(authHeader.substring(7))) {
        return status(401, {
          error: {
            code: 'TOKEN_INVALID',
            message: 'Invalid or expired token',
          },
        });
      }
    })
    // `onBeforeHandle` does not merge its return value into the handler
    // context, so returning `{ user }` from it leaves `ctx.user` undefined.
    // `resolve` is the hook that augments context.
    .resolve({ as: 'global' }, ({ request }) => {
      const authHeader = request.headers.get('authorization');
      return { user: verifyToken(authHeader ? authHeader.substring(7) : '') };
    });
}
