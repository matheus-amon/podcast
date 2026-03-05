'use client';

import { RegisterForm } from '@/components/auth/register-form';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-primary">
            Podcast SaaS
          </Link>
          <p className="text-muted-foreground mt-2">
            Create your account to get started
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
