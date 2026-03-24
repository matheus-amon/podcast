/**
 * JWT Utility Functions
 * 
 * Sign, verify, and refresh JWT tokens
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET environment variable is not set');
  console.error('Please set JWT_SECRET in your .env file or environment.');
  throw new Error('JWT_SECRET is required but was not provided');
}

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
 */
export function signRefreshToken(payload: Omit<JWTPayload, 'type'>): string {
  return jwt.sign(
    { ...payload, type: 'refresh' as const },
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
