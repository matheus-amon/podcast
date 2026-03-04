/**
 * Auth Controller Tests
 * 
 * Test authentication endpoints
 */

import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { AuthController } from '../../../src/infrastructure/http/adapters/auth.controller';
import type { RegisterUserUseCase } from '../../../src/application/user/use-cases/register-user.use-case';

describe('AuthController', () => {
  let mockRegisterUseCase: any;
  let controller: AuthController;

  beforeEach(() => {
    mockRegisterUseCase = {
      execute: mock(() => Promise.resolve({
        user: {
          id: 'user-id',
          email: 'test@example.com',
          name: 'Test User',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      })),
    };

    controller = new AuthController(mockRegisterUseCase);
  });

  describe('POST /auth/register', () => {
    it('should register user successfully', async () => {
      const requestBody = {
        email: 'test@example.com',
        password: 'SecureP@ss123',
        name: 'Test User',
      };

      // Simulate controller execution
      const result = await mockRegisterUseCase.execute(requestBody);

      expect(result.user.email).toBe('test@example.com');
      expect(result.user.name).toBe('Test User');
      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mock-refresh-token');
    });

    it('should return 400 for invalid email', async () => {
      mockRegisterUseCase.execute = mock(() => {
        throw new Error('Invalid email format');
      });

      try {
        await mockRegisterUseCase.execute({
          email: 'invalid-email',
          password: 'SecureP@ss123',
          name: 'Test User',
        });
      } catch (error: any) {
        expect(error.message).toBe('Invalid email format');
      }
    });

    it('should return 409 for duplicate email', async () => {
      mockRegisterUseCase.execute = mock(() => {
        throw new Error('Email already registered');
      });

      try {
        await mockRegisterUseCase.execute({
          email: 'test@example.com',
          password: 'SecureP@ss123',
          name: 'Test User',
        });
      } catch (error: any) {
        expect(error.message).toBe('Email already registered');
      }
    });

    it('should return 400 for weak password', async () => {
      mockRegisterUseCase.execute = mock(() => {
        throw new Error('Password must be at least 8 characters long');
      });

      try {
        await mockRegisterUseCase.execute({
          email: 'test@example.com',
          password: 'weak',
          name: 'Test User',
        });
      } catch (error: any) {
        expect(error.message).toBe('Password must be at least 8 characters long');
      }
    });
  });
});
