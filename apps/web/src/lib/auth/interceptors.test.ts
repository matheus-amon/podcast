// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  refreshAccessToken,
  createAuthFetch,
  fetchWithAuth,
  fetchJsonWithAuth,
} from './interceptors';

// Mock the process.env before any of the tests use it
const MOCK_API_BASE_URL = 'http://localhost:3001';
const originalEnv = process.env.NEXT_PUBLIC_API_URL;

// Mock localStorage for tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

describe('Auth Interceptors', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = MOCK_API_BASE_URL;
    originalFetch = global.fetch;
    global.fetch = vi.fn();

    // Clear mock storage
    localStorage.clear();

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_URL = originalEnv;
    global.fetch = originalFetch;
  });

  describe('refreshAccessToken', () => {
    it('should return new tokens on successful refresh', async () => {
      const mockTokens = { accessToken: 'new-access-token', refreshToken: 'new-refresh-token' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokens,
      });

      const result = await refreshAccessToken('old-refresh-token');

      expect(global.fetch).toHaveBeenCalledWith(`${MOCK_API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: 'old-refresh-token' }),
      });
      expect(result).toEqual(mockTokens);
    });

    it('should throw an error if refresh fails', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: { message: 'Invalid refresh token' } }),
      });

      await expect(refreshAccessToken('invalid-token')).rejects.toThrow('Invalid refresh token');
    });

    it('should throw default error message if error payload is not provided', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => Promise.reject(), // Simulate JSON parsing error
      });

      await expect(refreshAccessToken('bad-token')).rejects.toThrow('Failed to refresh token');
    });
  });

  describe('createAuthFetch', () => {
    const getAccessTokenMock = vi.fn();
    const getRefreshTokenMock = vi.fn();
    const onTokenRefreshedMock = vi.fn();
    const onAuthFailureMock = vi.fn();

    let authFetch: ReturnType<typeof createAuthFetch>;

    beforeEach(() => {
      authFetch = createAuthFetch(
        getAccessTokenMock,
        getRefreshTokenMock,
        onTokenRefreshedMock,
        onAuthFailureMock
      );
    });

    it('should throw an error if no access token is available', async () => {
      getAccessTokenMock.mockReturnValueOnce(null);

      await expect(authFetch('/some-endpoint')).rejects.toThrow('No access token available');
    });

    it('should make a successful request with the current access token', async () => {
      getAccessTokenMock.mockReturnValueOnce('valid-token');
      const mockResponse = { status: 200, ok: true };
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const response = await authFetch('/success-endpoint');

      expect(global.fetch).toHaveBeenCalledWith(`${MOCK_API_BASE_URL}/success-endpoint`, expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer valid-token'
        })
      }));
      expect(response).toEqual(mockResponse);
    });

    it('should automatically refresh the token and retry the request on 401', async () => {
      getAccessTokenMock.mockReturnValueOnce('expired-token');
      getRefreshTokenMock.mockReturnValueOnce('valid-refresh-token');

      const mockTokens = { accessToken: 'new-access-token', refreshToken: 'new-refresh-token' };

      // First call: The actual request fails with 401
      (global.fetch as any).mockResolvedValueOnce({ status: 401, ok: false });

      // Second call: The refresh endpoint succeeds
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokens,
      });

      // Third call: The retried request succeeds
      const retryResponse = { status: 200, ok: true };
      (global.fetch as any).mockResolvedValueOnce(retryResponse);

      const response = await authFetch('/protected-endpoint');

      // Assertions
      expect(onTokenRefreshedMock).toHaveBeenCalledWith(mockTokens);
      expect(response).toEqual(retryResponse);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should clear auth and throw an error if refresh token request fails', async () => {
      getAccessTokenMock.mockReturnValueOnce('expired-token');
      getRefreshTokenMock.mockReturnValueOnce('bad-refresh-token');

      // Initial request fails
      (global.fetch as any).mockResolvedValueOnce({ status: 401, ok: false });

      // Refresh request fails
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: { message: 'Refresh failed' } }),
      });

      await expect(authFetch('/protected-endpoint')).rejects.toThrow('Session expired');
      expect(onAuthFailureMock).toHaveBeenCalled();
    });

    it('should clear auth and throw an error if refresh token is not available', async () => {
      getAccessTokenMock.mockReturnValueOnce('expired-token');
      getRefreshTokenMock.mockReturnValueOnce(null);

      // Initial request fails
      (global.fetch as any).mockResolvedValueOnce({ status: 401, ok: false });

      await expect(authFetch('/protected-endpoint')).rejects.toThrow('Session expired');
      expect(onAuthFailureMock).toHaveBeenCalled();
    });
  });

  describe('fetchWithAuth', () => {
    it('should format relative URLs properly', async () => {
      localStorage.setItem('accessToken', 'test-token');
      (global.fetch as any).mockResolvedValueOnce({ status: 200, ok: true });

      await fetchWithAuth('/api/test');

      expect(global.fetch).toHaveBeenCalledWith(`${MOCK_API_BASE_URL}/api/test`, expect.anything());
    });

    it('should keep absolute URLs untouched', async () => {
      localStorage.setItem('accessToken', 'test-token');
      (global.fetch as any).mockResolvedValueOnce({ status: 200, ok: true });

      await fetchWithAuth('https://external-api.com/data');

      expect(global.fetch).toHaveBeenCalledWith('https://external-api.com/data', expect.anything());
    });

    it('should update localStorage after a successful refresh', async () => {
      localStorage.setItem('accessToken', 'expired-token');
      localStorage.setItem('refreshToken', 'valid-refresh-token');

      // 1: initial request 401
      (global.fetch as any).mockResolvedValueOnce({ status: 401, ok: false });
      // 2: refresh token request
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ accessToken: 'new-access', refreshToken: 'new-refresh' }),
      });
      // 3: retried request
      (global.fetch as any).mockResolvedValueOnce({ status: 200, ok: true });

      await fetchWithAuth('/api/protected');

      expect(localStorage.getItem('accessToken')).toBe('new-access');
      expect(localStorage.getItem('refreshToken')).toBe('new-refresh');
    });

    it('should clean localStorage on refresh failure', async () => {
      localStorage.setItem('accessToken', 'expired-token');
      localStorage.setItem('refreshToken', 'bad-refresh-token');

      // 1: initial request 401
      (global.fetch as any).mockResolvedValueOnce({ status: 401, ok: false });
      // 2: refresh token request 401 / fails
      (global.fetch as any).mockResolvedValueOnce({ ok: false, json: async () => ({}) });

      await expect(fetchWithAuth('/api/protected')).rejects.toThrow('Session expired');

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });

    it('should clean localStorage if no refresh token is present on 401', async () => {
      localStorage.setItem('accessToken', 'expired-token');
      // No refresh token set

      // 1: initial request 401
      (global.fetch as any).mockResolvedValueOnce({ status: 401, ok: false });

      await expect(fetchWithAuth('/api/protected')).rejects.toThrow('Session expired');

      expect(localStorage.getItem('accessToken')).toBeNull();
    });
  });

  describe('fetchJsonWithAuth', () => {
    it('should parse and return JSON from response', async () => {
      localStorage.setItem('accessToken', 'valid-token');
      const mockData = { id: 1, name: 'Test' };

      (global.fetch as any).mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => mockData,
      });

      const data = await fetchJsonWithAuth<{id: number, name: string}>('/api/json');

      expect(data).toEqual(mockData);
    });
  });
});
