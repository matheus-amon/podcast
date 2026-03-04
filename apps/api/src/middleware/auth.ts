/**
 * Auth Middleware
 * 
 * Validate JWT tokens and protect routes
 */

import { Elysia, t } from 'elysia';
import { verifyToken, type JWTPayload } from '../lib/jwt';

export interface AuthContext {
  user?: JWTPayload;
}

export function authMiddleware() {
  return new Elysia({
    name: 'auth-middleware',
  })
    .derive(
      { as: 'global' },
      ({ headers, set }) => {
        const authHeader = headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          set.status = 401;
          return {
            error: {
              code: 'TOKEN_MISSING',
              message: 'Authorization token is required',
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

        if (payload.type !== 'access') {
          set.status = 401;
          return {
            error: {
              code: 'TOKEN_TYPE_INVALID',
              message: 'Invalid token type',
            },
          };
        }

        return {
          user: payload,
        };
      }
    );
}
