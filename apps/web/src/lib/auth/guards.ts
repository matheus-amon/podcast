/**
 * Authentication Guards
 *
 * Client-side route protection utilities
 */

import { redirect } from 'next/navigation';
import { isAuthenticated } from './utils';

/**
 * Check if user is authenticated, redirect to login if not
 * 
 * Usage: Call this in server components or route handlers
 */
export function requireAuth() {
  if (!isAuthenticated()) {
    redirect('/login');
  }
}

/**
 * Get redirect URL for unauthenticated users
 */
export function getLoginRedirectUrl(): string {
  return '/login';
}

/**
 * Get redirect URL after successful login
 */
export function getPostLoginRedirectUrl(): string {
  return '/dashboard';
}
