/**
 * Register User Use Case Tests
 * 
 * Test user registration flow
 */

import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { RegisterUserUseCase } from './register-user.use-case';
import type { IUserRepository } from '@domain/user/ports/user-repository.port';
import type { IRefreshTokenRepository, RefreshToken } from '@domain/user/ports/refresh-token-repository.port';
import { User } from '@domain/user/entities/user.entity';

describe('RegisterUserUseCase', () => {
  let mockUserRepository: IUserRepository;
  let mockRefreshTokenRepository: IRefreshTokenRepository;
  let createdRefreshTokens: RefreshToken[];
  let useCase: RegisterUserUseCase;

  beforeEach(() => {
    // Mock repository
    mockUserRepository = {
      findById: mock(() => Promise.resolve(null)),
      findByEmail: mock(() => Promise.resolve(null)),
      create: mock(() => Promise.resolve({} as User)),
      update: mock(() => Promise.resolve({} as User)),
      delete: mock(() => Promise.resolve()),
    };

    createdRefreshTokens = [];
    mockRefreshTokenRepository = {
      findById: mock(() => Promise.resolve(null)),
      findByUserId: mock(() => Promise.resolve([])),
      create: mock((token: RefreshToken) => {
        createdRefreshTokens.push(token);
        return Promise.resolve(token);
      }),
      revoke: mock(() => Promise.resolve()),
      revokeAllForUser: mock(() => Promise.resolve()),
      cleanupExpired: mock(() => Promise.resolve()),
    };

    useCase = new RegisterUserUseCase(mockUserRepository, mockRefreshTokenRepository);
  });

  it('should register user successfully', async () => {
    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      name: 'Test User',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      toObject: () => ({
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    } as any;

    mockUserRepository.create = mock(() => Promise.resolve(mockUser));

    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'SecureP@ss123',
      name: 'Test User',
    });

    expect(result.user.email).toBe('test@example.com');
    expect(result.user.name).toBe('Test User');
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });

  // RefreshTokenUseCase only accepts a token it can find in the repository, so
  // a token that is minted but never persisted can never be exchanged. This
  // pins that registration stores what it hands out.
  it('should persist the refresh token it returns', async () => {
    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      name: 'Test User',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      toObject: () => ({ id: 'user-id' }),
    } as any;

    mockUserRepository.create = mock(() => Promise.resolve(mockUser));

    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'SecureP@ss123',
      name: 'Test User',
    });

    expect(createdRefreshTokens).toHaveLength(1);

    const stored = createdRefreshTokens[0];
    if (!stored) throw new Error('no refresh token was persisted');

    expect(stored.token).toBe(result.refreshToken);
    expect(stored.userId).toBe('user-id');
    expect(stored.revokedAt).toBeNull();
    expect(stored.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('should reject duplicate email', async () => {
    const existingUser = {
      id: 'existing-id',
      email: 'test@example.com',
      name: 'Existing User',
    } as any;

    mockUserRepository.findByEmail = mock(() => Promise.resolve(existingUser));

    expect(async () =>
      useCase.execute({
        email: 'test@example.com',
        password: 'SecureP@ss123',
        name: 'Test User',
      })
    ).toThrow('Email already registered');
  });
});
