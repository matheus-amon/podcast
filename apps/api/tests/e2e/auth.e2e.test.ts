/**
 * Authentication E2E Tests
 * 
 * End-to-end tests for authentication flow
 */

import { describe, it, expect } from 'bun:test';

describe('Authentication E2E', () => {
  const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3001';

  describe('POST /api/auth/register', () => {
    const testEmail = `test-${Date.now()}@example.com`;
    const testUser = {
      email: testEmail,
      password: 'SecureP@ss123',
      name: 'E2E Test User',
    };

    it('should register user successfully', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
      });

      expect(response.status).toBe(200);

      const data = await response.json();

      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(testUser.email);
      expect(data.user.name).toBe(testUser.name);
      expect(data.user.isActive).toBe(true);
      expect(data.accessToken).toBeDefined();
      expect(data.refreshToken).toBeDefined();
    });

    it('should return 400 for invalid email', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'invalid-email',
          password: testUser.password,
          name: testUser.name,
        }),
      });

      expect(response.status).toBe(400);
    });

    it('should return 400 for weak password', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `test-${Date.now() + 1}@example.com`,
          password: 'weak',
          name: testUser.name,
        }),
      });

      expect(response.status).toBe(400);
    });

    it('should return 400 for missing name', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `test-${Date.now() + 2}@example.com`,
          password: testUser.password,
          name: '',
        }),
      });

      expect(response.status).toBe(400);
    });
  });
});
