/**
 * Money Value Object
 *
 * Representa um valor monetário com validações
 * Imutável - qualquer operação retorna uma nova instância
 */

export interface MoneyProps {
  amount: number;
  currency?: string;
}

export class Money {
  private readonly _amount: number;
  private readonly _currency: string;

  constructor(props: MoneyProps) {
    // Validações
    if (props.amount < 0) {
      throw new Error('Amount cannot be negative');
    }

    if (!Number.isFinite(props.amount)) {
      throw new Error('Amount must be a finite number');
    }

    this._amount = Math.round(props.amount * 100) / 100; // 2 casas decimais
    this._currency = props.currency ?? 'BRL';
  }

  /**
   * Retorna o valor monetário
   */
  get amount(): number {
    return this._amount;
  }

  /**
   * Retorna a moeda
   */
  get currency(): string {
    return this._currency;
  }

  /**
   * Formata o valor como string (ex: "R$ 1.000,00")
   */
  toString(): string {
    return this.format();
  }

  /**
   * Formata o valor monetário
   */
  format(locale = 'pt-BR'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this._currency,
    }).format(this._amount);
  }

  /**
   * Adiciona outro valor monetário
   */
  add(other: Money): Money {
    if (this._currency !== other.currency) {
      throw new Error('Cannot add money with different currencies');
    }
    return new Money({ amount: this._amount + other.amount, currency: this._currency });
  }

  /**
   * Subtrai outro valor monetário
   */
  subtract(other: Money): Money {
    if (this._currency !== other.currency) {
      throw new Error('Cannot subtract money with different currencies');
    }
    if (other.amount > this._amount) {
      throw new Error('Cannot subtract amount greater than balance');
    }
    return new Money({ amount: this._amount - other.amount, currency: this._currency });
  }

  /**
   * Multiplica o valor por um fator
   */
  multiply(factor: number): Money {
    if (factor < 0) {
      throw new Error('Factor cannot be negative');
    }
    return new Money({ amount: this._amount * factor, currency: this._currency });
  }

  /**
   * Verifica se é igual a outro Money
   */
  equals(other: Money): boolean {
    return this._amount === other.amount && this._currency === other.currency;
  }

  /**
   * Verifica se é maior que outro Money
   */
  greaterThan(other: Money): boolean {
    if (this._currency !== other.currency) {
      throw new Error('Cannot compare money with different currencies');
    }
    return this._amount > other.amount;
  }

  /**
   * Verifica se é menor que outro Money
   */
  lessThan(other: Money): boolean {
    if (this._currency !== other.currency) {
      throw new Error('Cannot compare money with different currencies');
    }
    return this._amount < other.amount;
  }

  /**
   * Verifica se o valor é zero
   */
  isZero(): boolean {
    return this._amount === 0;
  }

  /**
   * Converte para objeto simples
   */
  toObject(): MoneyProps {
    return { amount: this._amount, currency: this._currency };
  }

  /**
   * Cria um Money com valor zero
   */
  static zero(currency = 'BRL'): Money {
    return new Money({ amount: 0, currency });
  }

  /**
   * Cria um Money a partir de um número
   */
  static fromAmount(amount: number, currency = 'BRL'): Money {
    return new Money({ amount, currency });
  }
}
