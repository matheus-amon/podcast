/**
 * Password Strength Meter Component
 *
 * Visual indicator of password strength
 */

'use client';

import { Check, X } from 'lucide-react';

interface PasswordRequirements {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const requirements: PasswordRequirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const metRequirements = Object.values(requirements).filter(Boolean).length;
  const strength = metRequirements / Object.keys(requirements).length;

  const getStrengthColor = () => {
    if (strength === 0) return 'bg-slate-200';
    if (strength < 0.4) return 'bg-red-500';
    if (strength < 0.6) return 'bg-yellow-500';
    if (strength < 0.8) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = () => {
    if (strength === 0) return 'Enter a password';
    if (strength < 0.4) return 'Weak';
    if (strength < 0.6) return 'Fair';
    if (strength < 0.8) return 'Good';
    return 'Strong';
  };

  const getStrengthWidth = () => {
    return `${strength * 100}%`;
  };

  const requirementsList = [
    { label: 'At least 8 characters', met: requirements.minLength },
    { label: 'One uppercase letter', met: requirements.hasUppercase },
    { label: 'One lowercase letter', met: requirements.hasLowercase },
    { label: 'One number', met: requirements.hasNumber },
    { label: 'One special character', met: requirements.hasSpecialChar },
  ];

  return (
    <div className="space-y-3">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Password strength</span>
          <span className="font-medium text-foreground">{getStrengthLabel()}</span>
        </div>
        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${getStrengthColor()} transition-all duration-300`}
            style={{ width: getStrengthWidth() }}
          />
        </div>
      </div>

      {/* Requirements List */}
      <div className="space-y-1">
        {requirementsList.map((req, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            {req.met ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <X className="h-3 w-3 text-slate-400" />
            )}
            <span className={req.met ? 'text-green-600' : 'text-muted-foreground'}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
