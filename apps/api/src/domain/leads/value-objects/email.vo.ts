/**
 * Email Value Object
 * 
 * Representa um email válido com validação embutida
 */

export class Email {
  private readonly _value: string;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new Error('Invalid email address');
    }

    this._value = value.toLowerCase().trim();
  }

  /**
   * Retorna o valor do email
   */
  get value(): string {
    return this._value;
  }

  /**
   * Valida se um email é válido (RFC 5322)
   */
  private isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Compara dois emails
   */
  equals(other: Email): boolean {
    return this._value === other._value;
  }

  /**
   * Converte para string
   */
  toString(): string {
    return this._value;
  }
}
