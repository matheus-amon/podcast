/**
 * Login User Use Case Tests
 * 
 * Test user login flow
 */

import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { LoginUserUseCase } from './login-user.use-case';
import type { IUserRepository } from '../../../domain/user/ports/user-repository.port';
import type { IRefreshTokenRepository, RefreshToken } from '../../../domain/user/ports/refresh-token-repository.port';
import { User } from '../../../domain/user/entities/user.entity';
import { hashPassword } from '../../../lib/password';

describe('LoginUserUseCase', () => {
  let mockUserRepository: IUserRepository;
  let createdRefreshTokens: RefreshToken[];
  let useCase: LoginUserUseCase;

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
    const mockRefreshTokenRepository: IRefreshTokenRepository = {
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

    useCase = new LoginUserUseCase(mockUserRepository, mockRefreshTokenRepository);
  });

  it('should login user successfully', async () => {
    const passwordHash = await hashPassword('SecureP@ss123');
    
    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      name: 'Test User',
      passwordHash,
      isActive: true,
      toObject: () => ({
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      updateLastLogin: mock(() => {}),
    } as any;

    mockUserRepository.findByEmail = mock(() => Promise.resolve(mockUser));
    mockUserRepository.update = mock(() => Promise.resolve(mockUser));

    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'SecureP@ss123',
    });

    expect(result.user.email).toBe('test@example.com');
    expect(result.user.name).toBe('Test User');
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });

  // Same reason as the register case: a refresh token that is not persisted
  // cannot be exchanged by RefreshTokenUseCase.
  it('should persist the refresh token it returns', async () => {
    const passwordHash = await hashPassword('SecureP@ss123');

    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      name: 'Test User',
      passwordHash,
      isActive: true,
      toObject: () => ({ id: 'user-id' }),
      updateLastLogin: mock(() => {}),
    } as any;

    mockUserRepository.findByEmail = mock(() => Promise.resolve(mockUser));
    mockUserRepository.update = mock(() => Promise.resolve(mockUser));

    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'SecureP@ss123',
    });

    expect(createdRefreshTokens).toHaveLength(1);

    const stored = createdRefreshTokens[0];
    if (!stored) throw new Error('no refresh token was persisted');

    expect(stored.token).toBe(result.refreshToken);
    expect(stored.userId).toBe('user-id');
    expect(stored.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('should reject invalid email format', () => {
    expect(() =>
      useCase.execute({
        email: 'invalid-email',
        password: 'SecureP@ss123',
      })
    ).toThrow('Invalid email format');
  });

  it('should reject non-existent email', async () => {
    mockUserRepository.findByEmail = mock(() => Promise.resolve(null));

    expect(async () =>
      useCase.execute({
        email: 'nonexistent@example.com',
        password: 'SecureP@ss123',
      })
    ).toThrow('Invalid credentials');
  });

  it('should reject inactive user', async () => {
    const inactiveUser = {
      id: 'user-id',
      email: 'test@example.com',
      passwordHash: 'hashed-password',
      isActive: false,
    } as any;

    mockUserRepository.findByEmail = mock(() => Promise.resolve(inactiveUser));

    expect(async () =>
      useCase.execute({
        email: 'test@example.com',
        password: 'SecureP@ss123',
      })
    ).toThrow('Account is deactivated');
  });

  it('should reject wrong password', async () => {
    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      passwordHash: 'wrong-hash',
      isActive: true,
    } as any;

    mockUserRepository.findByEmail = mock(() => Promise.resolve(mockUser));

    expect(async () =>
      useCase.execute({
        email: 'test@example.com',
        password: 'SecureP@ss123',
      })
    ).toThrow('Invalid credentials');
  });
});
