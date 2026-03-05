/**
 * Token Refresh Interceptor
 *
 * Automatically refreshes access tokens when receiving 401 responses
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Call the refresh endpoint to get new tokens
 */
export async function refreshAccessToken(refreshToken: string): Promise<RefreshTokenResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Token refresh failed' }));
    throw new Error(error.error?.message || 'Failed to refresh token');
  }

  const data = await response.json();
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  };
}

/**
 * Create a fetch wrapper that automatically handles token refresh
 */
export function createAuthFetch(
  getAccessToken: () => string | null,
  getRefreshToken: () => string | null,
  onTokenRefreshed: (tokens: RefreshTokenResponse) => void,
  onAuthFailure: () => void
) {
  return async function authFetch(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    let accessToken = getAccessToken();

    if (!accessToken) {
      throw new Error('No access token available');
    }

    // First attempt with current token
    let response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        ...options.headers,
      },
    });

    // If 401, try to refresh token
    if (response.status === 401) {
      const refreshToken = getRefreshToken();

      if (refreshToken) {
        try {
          // Refresh the tokens
          const tokens = await refreshAccessToken(refreshToken);

          // Save new tokens
          onTokenRefreshed(tokens);

          // Retry the original request with new token
          response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${tokens.accessToken}`,
              ...options.headers,
            },
          });
        } catch (refreshError) {
          // Refresh failed - clear auth and redirect to login
          onAuthFailure();
          throw new Error('Session expired');
        }
      } else {
        // No refresh token - clear auth and redirect
        onAuthFailure();
        throw new Error('Session expired');
      }
    }

    return response;
  };
}

/**
 * Fetch wrapper with automatic token refresh
 */
export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

  if (!accessToken) {
    throw new Error('No access token available');
  }

  // First attempt with current token
  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  // If 401, try to refresh token
  if (response.status === 401) {
    if (refreshToken) {
      try {
        // Refresh the tokens
        const tokens = await refreshAccessToken(refreshToken);

        // Save new tokens
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);

        // Retry the original request with new token
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokens.accessToken}`,
            ...options.headers,
          },
        });
      } catch (refreshError) {
        // Refresh failed - clear auth
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        throw new Error('Session expired');
      }
    } else {
      // No refresh token - clear auth
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      throw new Error('Session expired');
    }
  }

  return response;
}

/**
 * JSON fetch wrapper with automatic token refresh
 */
export async function fetchJsonWithAuth<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetchWithAuth(endpoint, options);
  return response.json() as Promise<T>;
}
