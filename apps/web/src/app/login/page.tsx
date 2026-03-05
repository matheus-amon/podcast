'use client';

import { LoginForm } from '@/components/auth/login-form';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-primary">
            Podcast SaaS
          </Link>
          <p className="text-muted-foreground mt-2">
            Sign in to continue to your account
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
