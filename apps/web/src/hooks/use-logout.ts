'use client';

import { useRouter } from 'next/navigation';

export function useLogout() {
  const router = useRouter();
  const isLoading = false;

  const logout = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');

      // Call logout endpoint
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: localStorage.getItem('refreshToken'),
        }),
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens and redirect
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      router.push('/login');
    }
  };

  return {
    logout,
    isLoading,
  };
}
