/**
 * Logout Controller Tests
 * 
 * Test logout endpoint
 */

import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { LogoutController } from '../../../src/infrastructure/http/adapters/logout.controller';
import type { LogoutUserUseCase } from '../../../src/application/user/use-cases/logout-user.use-case';

describe('LogoutController', () => {
  let mockLogoutUseCase: any;
  let controller: LogoutController;

  beforeEach(() => {
    mockLogoutUseCase = {
      execute: mock(() => Promise.resolve({
        success: true,
        message: 'Logout successful',
      })),
    };

    controller = new LogoutController(mockLogoutUseCase);
  });

  describe('POST /auth/logout', () => {
    it('should logout user successfully', async () => {
      const result = await mockLogoutUseCase.execute();

      expect(result.success).toBe(true);
      expect(result.message).toBe('Logout successful');
    });
  });
});
