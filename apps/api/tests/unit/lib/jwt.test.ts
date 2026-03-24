/**
 * JWT Utility Tests
 */

import { describe, it, expect } from 'bun:test';
import * as jwtUtils from '../../../src/lib/jwt';

describe('JWT Lib', () => {
  it('should sign and verify an access token', () => {
    const payload = {
      userId: 'test-user-id',
      email: 'test@example.com',
    };

    const token = jwtUtils.signAccessToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const decoded = jwtUtils.verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.email).toBe(payload.email);
    expect(decoded?.type).toBe('access');
  });

  it('should sign and verify a refresh token', () => {
    const payload = {
      userId: 'test-user-id',
      email: 'test@example.com',
    };

    const token = jwtUtils.signRefreshToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const decoded = jwtUtils.verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.email).toBe(payload.email);
    expect(decoded?.type).toBe('refresh');
  });

  it('should return null for invalid token', () => {
    const decoded = jwtUtils.verifyToken('invalid-token');
    expect(decoded).toBeNull();
  });

  it('should get token expiration', () => {
    const payload = {
      userId: 'test-user-id',
      email: 'test@example.com',
    };

    const token = jwtUtils.signAccessToken(payload);
    const expiration = jwtUtils.getTokenExpiration(token);

    expect(expiration).toBeInstanceOf(Date);
    expect(expiration!.getTime()).toBeGreaterThan(Date.now());
  });
});
