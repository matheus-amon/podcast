'use client';

import { LogOut } from 'lucide-react';
import { useLogout } from '@/hooks/use-logout';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const { logout, isLoading } = useLogout();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={logout}
      disabled={isLoading}
      className="gap-2"
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">Sign Out</span>
    </Button>
  );
}
