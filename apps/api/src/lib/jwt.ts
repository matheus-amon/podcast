/**
 * JWT Utility Functions
 * 
 * Sign, verify, and refresh JWT tokens
 */

import jwt from 'jsonwebtoken';
import { randomBytes, randomUUID } from 'node:crypto';

/**
 * Resolves the signing secret.
 *
 * There is deliberately no hardcoded fallback. A committed default secret is
 * a forgeable-token vulnerability: anyone who reads the repository can mint a
 * valid access token for any userId.
 *
 * In production the variable is required. Elsewhere an ephemeral random secret
 * is generated so local development still works, at the cost of tokens not
 * surviving a restart.
 */
function resolveJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'JWT_SECRET is required when NODE_ENV=production. Generate one with: openssl rand -hex 32'
    );
  }

  console.warn(
    '⚠️  JWT_SECRET is not set. Generated an ephemeral secret for this process; tokens will not survive a restart.'
  );

  return randomBytes(32).toString('hex');
}

const JWT_SECRET = resolveJwtSecret();
const JWT_EXPIRES_IN = '15m'; // Access token: 15 minutes
const REFRESH_TOKEN_EXPIRES_IN = '7d'; // Refresh token: 7 days

export interface JWTPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

/**
 * Sign an access token
 */
export function signAccessToken(payload: Omit<JWTPayload, 'type'>): string {
  return jwt.sign(
    { ...payload, type: 'access' as const },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Sign a refresh token
 *
 * The `jti` is what makes each token distinct. Without it the payload is only
 * userId + email + type + iat + exp, so two refreshes within the same second
 * produce byte-identical tokens — and since `refresh_tokens.token` is unique,
 * rotation then fails on insert and the client is left with a revoked token it
 * cannot replace.
 */
export function signRefreshToken(payload: Omit<JWTPayload, 'type'>): string {
  return jwt.sign(
    { ...payload, type: 'refresh' as const, jti: randomUUID() },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );
}

/**
 * Verify a token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Get token expiration date
 */
export function getTokenExpiration(token: string): Date | null {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) return null;
    return new Date(decoded.exp * 1000);
  } catch {
    return null;
  }
}
