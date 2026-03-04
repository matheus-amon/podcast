/**
 * Register User Use Case Tests
 * 
 * Test user registration flow
 */

import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { RegisterUserUseCase } from './register-user.use-case';
import type { IUserRepository } from '../../../../domain/user/ports/user-repository.port';
import { User } from '../../../../domain/user/entities/user.entity';

describe('RegisterUserUseCase', () => {
  let mockUserRepository: IUserRepository;
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

    useCase = new RegisterUserUseCase(mockUserRepository);
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
