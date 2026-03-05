/**
 * Token Refresh Use Case Tests
 *
 * Test token refresh flow
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { RefreshTokenUseCase } from './refresh-token.use-case';
import type { IRefreshTokenRepository, RefreshToken } from '../../../domain/user/ports/refresh-token-repository.port';
import { signRefreshToken, verifyToken } from '../../../lib/jwt';

// Mock repository
class MockRefreshTokenRepository implements IRefreshTokenRepository {
  private tokens: Map<string, RefreshToken> = new Map();

  async findById(id: string): Promise<RefreshToken | null> {
    return this.tokens.get(id) || null;
  }

  async findByUserId(userId: string): Promise<RefreshToken[]> {
    return Array.from(this.tokens.values()).filter(t => t.userId === userId);
  }

  async create(token: RefreshToken): Promise<RefreshToken> {
    this.tokens.set(token.id, token);
    return token;
  }

  async revoke(token: string): Promise<void> {
    for (const [id, t] of this.tokens.entries()) {
      if (t.token === token) {
        this.tokens.set(id, {
          ...t,
          revokedAt: new Date(),
          usedAt: new Date(),
        });
        break;
      }
    }
  }

  async revokeAllForUser(userId: string): Promise<void> {
    for (const [id, t] of this.tokens.entries()) {
      if (t.userId === userId) {
        this.tokens.set(id, {
          ...t,
          revokedAt: new Date(),
        });
      }
    }
  }

  async cleanupExpired(): Promise<void> {
    const now = new Date();
    for (const [id, t] of this.tokens.entries()) {
      if (t.expiresAt < now) {
        this.tokens.delete(id);
      }
    }
  }

  // Test helper
  clear(): void {
    this.tokens.clear();
  }
}

describe('RefreshTokenUseCase', () => {
  let refreshUseCase: RefreshTokenUseCase;
  let refreshRepo: MockRefreshTokenRepository;

  const testUser = {
    userId: 'test-user-id',
    email: 'test@example.com',
  };

  beforeEach(() => {
    refreshRepo = new MockRefreshTokenRepository();
    refreshUseCase = new RefreshTokenUseCase(refreshRepo);
  });

  it('should refresh token successfully', async () => {
    // Create a valid refresh token
    const refreshToken = signRefreshToken(testUser);

    // Store token in repository
    await refreshRepo.create({
      id: crypto.randomUUID(),
      userId: testUser.userId,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      usedAt: null,
      revokedAt: null,
      createdAt: new Date(),
    });

    // Small delay to ensure different token timestamp
    await new Promise(resolve => setTimeout(resolve, 10));

    // Execute refresh
    const result = await refreshUseCase.execute({ refreshToken });

    // Verify new tokens
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();

    // Verify new access token payload
    const accessPayload = verifyToken(result.accessToken);
    expect(accessPayload).not.toBeNull();
    expect(accessPayload?.userId).toBe(testUser.userId);
    expect(accessPayload?.email).toBe(testUser.email);
    expect(accessPayload?.type).toBe('access');

    // Verify new refresh token payload
    const refreshPayload = verifyToken(result.refreshToken);
    expect(refreshPayload).not.toBeNull();
    expect(refreshPayload?.userId).toBe(testUser.userId);
    expect(refreshPayload?.email).toBe(testUser.email);
    expect(refreshPayload?.type).toBe('refresh');
  });

  it('should reject expired refresh token', async () => {
    // Create an expired refresh token
    const expiredToken = signRefreshToken(testUser);

    // Store expired token
    await refreshRepo.create({
      id: crypto.randomUUID(),
      userId: testUser.userId,
      token: expiredToken,
      expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
      usedAt: null,
      revokedAt: null,
      createdAt: new Date(),
    });

    // Execute refresh should fail
    await expect(refreshUseCase.execute({ refreshToken: expiredToken })).rejects.toThrow(
      'Refresh token expired'
    );
  });

  it('should reject invalid refresh token', async () => {
    // Invalid token
    const invalidToken = 'invalid-token';

    // Execute refresh should fail
    await expect(refreshUseCase.execute({ refreshToken: invalidToken })).rejects.toThrow(
      'Invalid refresh token'
    );
  });

  it('should reject revoked refresh token', async () => {
    // Create a valid refresh token
    const refreshToken = signRefreshToken(testUser);

    // Store and revoke token
    await refreshRepo.create({
      id: crypto.randomUUID(),
      userId: testUser.userId,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      usedAt: null,
      revokedAt: new Date(), // Already revoked
      createdAt: new Date(),
    });

    // Execute refresh should fail
    await expect(refreshUseCase.execute({ refreshToken })).rejects.toThrow(
      'Refresh token revoked'
    );
  });

  it('should revoke old refresh token after successful refresh', async () => {
    // Create a valid refresh token
    const refreshToken = signRefreshToken(testUser);

    // Store token
    const storedToken = await refreshRepo.create({
      id: crypto.randomUUID(),
      userId: testUser.userId,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      usedAt: null,
      revokedAt: null,
      createdAt: new Date(),
    });

    // Execute refresh
    await refreshUseCase.execute({ refreshToken });

    // Verify old token was revoked
    const updatedToken = await refreshRepo.findById(storedToken.id);
    expect(updatedToken?.revokedAt).toBeDefined();
    expect(updatedToken?.usedAt).toBeDefined();
  });

  it('should create new refresh token record in repository', async () => {
    // Create a valid refresh token
    const refreshToken = signRefreshToken(testUser);

    // Store token
    const tokenId = crypto.randomUUID();
    await refreshRepo.create({
      id: tokenId,
      userId: testUser.userId,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      usedAt: null,
      revokedAt: null,
      createdAt: new Date(),
    });

    // Execute refresh
    const result = await refreshUseCase.execute({ refreshToken });

    // Verify new token was created
    const updatedTokens = await refreshRepo.findByUserId(testUser.userId);
    expect(updatedTokens.length).toBe(2);

    // Verify old token was revoked
    const oldTokenRecord = updatedTokens.find(t => t.id === tokenId);
    expect(oldTokenRecord).toBeDefined();
    expect(oldTokenRecord?.revokedAt).toBeDefined();
    expect(oldTokenRecord?.usedAt).toBeDefined();

    // Verify a new token exists (different from the old one)
    const newTokenRecord = updatedTokens.find(t => t.id !== tokenId);
    expect(newTokenRecord).toBeDefined();
    expect(newTokenRecord?.revokedAt).toBeNull();

    // Verify returned tokens are valid
    const accessPayload = verifyToken(result.accessToken);
    expect(accessPayload?.userId).toBe(testUser.userId);

    const refreshPayload = verifyToken(result.refreshToken);
    expect(refreshPayload?.userId).toBe(testUser.userId);
  });
});
