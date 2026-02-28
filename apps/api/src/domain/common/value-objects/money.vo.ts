/**
 * Money Value Object
 * 
 * Representa valores monetários de forma segura, evitando
 * problemas com floating point arithmetic.
 * 
 * Armazena valores em centavos (número inteiro) para precisão.
 */

export interface MoneyProps {
  amount: number; // Valor em centavos
  currency: string; // ISO 4217: BRL, USD, etc.
}

export class Money {
  private readonly props: MoneyProps;

  constructor(amount: number, currency: string = 'BRL') {
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }

    this.props = {
      amount,
      currency: currency.toUpperCase(),
    };
  }

  /**
   * Retorna o valor em centavos
   */
  get cents(): number {
    return this.props.amount;
  }

  /**
   * Retorna o valor em unidades (com decimal)
   */
  get amount(): number {
    return this.props.amount / 100;
  }

  /**
   * Retorna o código da moeda
   */
  get currency(): string {
    return this.props.currency;
  }

  /**
   * Soma dois valores monetários
   */
  add(other: Money): Money {
    if (this.props.currency !== other.props.currency) {
      throw new Error('Cannot add money with different currencies');
    }

    return new Money(this.props.amount + other.props.amount, this.props.currency);
  }

  /**
   * Subtrai dois valores monetários
   */
  subtract(other: Money): Money {
    if (this.props.currency !== other.props.currency) {
      throw new Error('Cannot subtract money with different currencies');
    }

    const result = this.props.amount - other.props.amount;
    if (result < 0) {
      throw new Error('Result cannot be negative');
    }

    return new Money(result, this.props.currency);
  }

  /**
   * Multiplica o valor por um fator
   */
  multiply(factor: number): Money {
    if (factor < 0) {
      throw new Error('Factor cannot be negative');
    }

    return new Money(Math.round(this.props.amount * factor), this.props.currency);
  }

  /**
   * Divide o valor por um divisor
   */
  divide(divisor: number): Money {
    if (divisor <= 0) {
      throw new Error('Divisor must be positive');
    }

    return new Money(Math.round(this.props.amount / divisor), this.props.currency);
  }

  /**
   * Compara dois valores monetários
   */
  equals(other: Money): boolean {
    return (
      this.props.amount === other.props.amount &&
      this.props.currency === other.props.currency
    );
  }

  /**
   * Verifica se é maior que outro valor
   */
  greaterThan(other: Money): boolean {
    if (this.props.currency !== other.props.currency) {
      throw new Error('Cannot compare money with different currencies');
    }

    return this.props.amount > other.props.amount;
  }

  /**
   * Verifica se é menor que outro valor
   */
  lessThan(other: Money): boolean {
    if (this.props.currency !== other.props.currency) {
      throw new Error('Cannot compare money with different currencies');
    }

    return this.props.amount < other.props.amount;
  }

  /**
   * Formata o valor como string (ex: "R$ 1.000,00")
   */
  toString(): string {
    const symbols: Record<string, string> = {
      BRL: 'R$',
      USD: '$',
      EUR: '€',
    };

    const symbol = symbols[this.props.currency] || this.props.currency;
    const formatted = (this.amount).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return `${symbol} ${formatted}`;
  }

  /**
   * Cria um valor monetário a partir de reais
   */
  static fromReais(reais: number): Money {
    return new Money(Math.round(reais * 100), 'BRL');
  }

  /**
   * Cria um valor monetário zero
   */
  static zero(currency: string = 'BRL'): Money {
    return new Money(0, currency);
  }
}
