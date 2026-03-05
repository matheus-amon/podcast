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

  describe('POST /api/auth/refresh', () => {
    let refreshToken: string;
    let accessToken: string;
    let userId: string;

    beforeEach(async () => {
      // Register a test user and get tokens
      const testEmail = `test-refresh-${Date.now()}@example.com`;
      const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'SecureP@ss123',
          name: 'Refresh Test User',
        }),
      });

      const data = await registerResponse.json();
      refreshToken = data.refreshToken;
      accessToken = data.accessToken;
      userId = data.user.id;
    });

    it('should refresh tokens successfully', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.accessToken).toBeDefined();
      expect(data.refreshToken).toBeDefined();
      expect(data.refreshToken).not.toBe(refreshToken);
    });

    it('should return 400 for missing refresh token', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
    });

    it('should return 401 for invalid refresh token', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: 'invalid-token' }),
      });

      expect(response.status).toBe(401);
    });

    it('should return 401 for expired refresh token', async () => {
      // Create an expired token (manipulate for testing)
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0IiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwidHlwZSI6InJlZnJlc2giLCJpYXQiOjAsImV4cCI6MH0.expired';

      const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: expiredToken }),
      });

      expect(response.status).toBe(401);
    });

    it('should allow accessing protected route with new access token', async () => {
      // Refresh tokens
      const refreshResponse = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const { accessToken: newAccessToken } = await refreshResponse.json();

      // Access protected route
      const meResponse = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${newAccessToken}`,
        },
      });

      expect(meResponse.status).toBe(200);
      const data = await meResponse.json();
      expect(data.user).toBeDefined();
    });
  });

  describe('Session Persistence', () => {
    let refreshToken: string;
    let accessToken: string;

    beforeEach(async () => {
      // Register a test user and get tokens
      const testEmail = `test-session-${Date.now()}@example.com`;
      const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'SecureP@ss123',
          name: 'Session Test User',
        }),
      });

      const data = await registerResponse.json();
      refreshToken = data.refreshToken;
      accessToken = data.accessToken;
    });

    it('should maintain session after token refresh', async () => {
      // Initial request to /me
      const initialMeResponse = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      expect(initialMeResponse.status).toBe(200);
      const initialData = await initialMeResponse.json();

      // Refresh tokens
      const refreshResponse = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await refreshResponse.json();

      // Request to /me with new token
      const newMeResponse = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${newAccessToken}`,
        },
      });

      expect(newMeResponse.status).toBe(200);
      const newData = await newMeResponse.json();

      // Verify same user session
      expect(newData.user.userId).toBe(initialData.user.userId);
      expect(newData.user.email).toBe(initialData.user.email);
    });

    it('should invalidate old refresh token after refresh', async () => {
      // First refresh
      const refreshResponse1 = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      expect(refreshResponse1.status).toBe(200);
      const { refreshToken: newRefreshToken } = await refreshResponse1.json();

      // Try to use old refresh token again
      const refreshResponse2 = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      // Should fail - old token was revoked
      expect(refreshResponse2.status).toBe(401);

      // But new token should work
      const refreshResponse3 = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: newRefreshToken }),
      });

      expect(refreshResponse3.status).toBe(200);
    });
  });
});
