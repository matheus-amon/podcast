/**
 * Email Value Object
 * 
 * Represents a validated email address
 */

export class Email {
  private readonly _value: string;

  constructor(value: string) {
    const normalized = value.trim().toLowerCase();
    
    if (!this.isValidEmail(normalized)) {
      throw new Error('Invalid email format');
    }

    this._value = normalized;
  }

  /**
   * Get the email value
   */
  get value(): string {
    return this._value;
  }

  /**
   * Check if email is valid
   */
  private isValidEmail(email: string): boolean {
    // RFC 5322 compliant email regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  }

  /**
   * Check if this email equals another
   */
  equals(other: Email): boolean {
    return this._value === other._value;
  }

  /**
   * Convert to string
   */
  toString(): string {
    return this._value;
  }
}
