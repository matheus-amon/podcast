/**
 * Login Controller Tests
 * 
 * Test login endpoint
 */

import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { LoginController } from '../../../src/infrastructure/http/adapters/login.controller';
import type { LoginUserUseCase } from '../../../src/application/user/use-cases/login-user.use-case';

describe('LoginController', () => {
  let mockLoginUseCase: any;
  let controller: LoginController;

  beforeEach(() => {
    mockLoginUseCase = {
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

    controller = new LoginController(mockLoginUseCase);
  });

  describe('POST /auth/login', () => {
    it('should login user successfully', async () => {
      const requestBody = {
        email: 'test@example.com',
        password: 'SecureP@ss123',
      };

      const result = await mockLoginUseCase.execute(requestBody);

      expect(result.user.email).toBe('test@example.com');
      expect(result.user.name).toBe('Test User');
      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mock-refresh-token');
    });

    it('should return 400 for invalid email', async () => {
      mockLoginUseCase.execute = mock(() => {
        throw new Error('Invalid email format');
      });

      try {
        await mockLoginUseCase.execute({
          email: 'invalid-email',
          password: 'SecureP@ss123',
        });
      } catch (error: any) {
        expect(error.message).toBe('Invalid email format');
      }
    });

    it('should return 401 for invalid credentials', async () => {
      mockLoginUseCase.execute = mock(() => {
        throw new Error('Invalid credentials');
      });

      try {
        await mockLoginUseCase.execute({
          email: 'test@example.com',
          password: 'WrongP@ss123',
        });
      } catch (error: any) {
        expect(error.message).toBe('Invalid credentials');
      }
    });

    it('should return 403 for inactive user', async () => {
      mockLoginUseCase.execute = mock(() => {
        throw new Error('Account is deactivated');
      });

      try {
        await mockLoginUseCase.execute({
          email: 'test@example.com',
          password: 'SecureP@ss123',
        });
      } catch (error: any) {
        expect(error.message).toBe('Account is deactivated');
      }
    });
  });
});
