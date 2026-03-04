/**
 * Logout User Use Case Tests
 * 
 * Test user logout flow
 */

import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { LogoutUserUseCase } from './logout-user.use-case';
import type { IRefreshTokenRepository } from '../../../domain/user/ports/refresh-token-repository.port';

describe('LogoutUserUseCase', () => {
  let mockRefreshTokenRepository: IRefreshTokenRepository;
  let useCase: LogoutUserUseCase;

  beforeEach(() => {
    // Mock repository
    mockRefreshTokenRepository = {
      findById: mock(() => Promise.resolve(null)),
      findByUserId: mock(() => Promise.resolve([])),
      create: mock(() => Promise.resolve({} as any)),
      revoke: mock(() => Promise.resolve()),
      revokeAllForUser: mock(() => Promise.resolve()),
      cleanupExpired: mock(() => Promise.resolve()),
    };

    useCase = new LogoutUserUseCase(mockRefreshTokenRepository);
  });

  it('should logout user successfully', async () => {
    const result = await useCase.execute({
      userId: 'user-id',
      refreshToken: 'valid-refresh-token',
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe('Logout successful');
  });

  it('should revoke refresh token', async () => {
    await useCase.execute({
      userId: 'user-id',
      refreshToken: 'valid-refresh-token',
    });

    expect(mockRefreshTokenRepository.revoke).toHaveBeenCalledWith('valid-refresh-token');
  });

  it('should handle missing refresh token', async () => {
    const result = await useCase.execute({
      userId: 'user-id',
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe('Logout successful');
  });

  it('should handle non-existent token gracefully', async () => {
    mockRefreshTokenRepository.revoke = mock(() => {
      throw new Error('Token not found');
    });

    const result = await useCase.execute({
      userId: 'user-id',
      refreshToken: 'invalid-token',
    });

    expect(result.success).toBe(true);
  });
});
