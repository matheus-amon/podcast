/**
 * Password Value Object
 * 
 * Represents a validated and hashed password
 */

import { hashPassword, comparePassword, validatePasswordStrength } from '../../../lib/password';

export class Password {
  private readonly _value: string;

  constructor(value: string) {
    const validation = Password.validateStrength(value);
    
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    this._value = value;
  }

  /**
   * Get the plain password value (use carefully)
   */
  get value(): string {
    return this._value;
  }

  /**
   * Hash the password
   */
  async hash(): Promise<string> {
    return hashPassword(this._value);
  }

  /**
   * Compare password with a hash
   */
  async compare(hash: string): Promise<boolean> {
    return comparePassword(this._value, hash);
  }

  /**
   * Validate password strength (static method)
   */
  static validateStrength(password: string): {
    valid: boolean;
    errors: string[];
  } {
    return validatePasswordStrength(password);
  }
}
