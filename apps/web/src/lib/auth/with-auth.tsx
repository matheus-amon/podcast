/**
 * With Auth HOC
 *
 * Higher-order component that protects routes requiring authentication
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth/utils';

interface WithAuthOptions {
  redirectTo?: string;
  allowAuthenticatedOnly?: boolean;
}

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const {
    redirectTo = '/login',
    allowAuthenticatedOnly = true,
  } = options;

  function WithAuthWrapper(props: P) {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);
    const [isAllowed, setIsAllowed] = useState(false);

    useEffect(() => {
      const checkAuth = () => {
        const authenticated = isAuthenticated();

        if (allowAuthenticatedOnly && !authenticated) {
          // User is not authenticated, redirect to login
          router.push(redirectTo);
          setIsAllowed(false);
        } else {
          // User is authenticated or route allows unauthenticated access
          setIsAllowed(true);
        }

        setIsChecking(false);
      };

      checkAuth();
    }, [allowAuthenticatedOnly, allowAuthenticatedOnly, router, redirectTo]);

    // Show loading state while checking authentication
    if (isChecking) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      );
    }

    // Don't render if not allowed
    if (!isAllowed) {
      return null;
    }

    return <WrappedComponent {...props} />;
  }

  WithAuthWrapper.displayName = `withAuth(${getDisplayName(WrappedComponent)})`;

  return WithAuthWrapper;
}

function getDisplayName(component: React.ComponentType<any>): string {
  return component.displayName || component.name || 'Component';
}
