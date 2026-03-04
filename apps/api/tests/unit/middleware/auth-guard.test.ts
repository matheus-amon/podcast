/**
 * Auth Guard Tests
 *
 * Test authentication guard middleware
 */

import { describe, it, expect } from 'bun:test';
import { verifyToken } from '../../../src/lib/jwt';
import { signAccessToken } from '../../../src/lib/jwt';

describe('AuthGuard', () => {
  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
  const mockEmail = 'test@example.com';

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const token = signAccessToken({ userId: mockUserId, email: mockEmail });
      const payload = verifyToken(token);

      expect(payload).toBeTruthy();
      expect(payload?.userId).toBe(mockUserId);
      expect(payload?.email).toBe(mockEmail);
      expect(payload?.type).toBe('access');
    });

    it('should return null for invalid token', () => {
      const payload = verifyToken('invalid-token');
      expect(payload).toBeNull();
    });

    it('should return null for tampered token', () => {
      const token = signAccessToken({ userId: mockUserId, email: mockEmail });
      const payload = verifyToken(token + 'tampered');
      expect(payload).toBeNull();
    });
  });

  describe('Token Validation', () => {
    it('should create valid access token', () => {
      const token = signAccessToken({ userId: mockUserId, email: mockEmail });
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });
});
