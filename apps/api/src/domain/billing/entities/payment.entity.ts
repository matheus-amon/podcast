/**
 * Payment Entity
 *
 * Representa um pagamento associado a uma invoice
 */

import { BaseEntity } from '@domain/common/entities/base.entity';
import type { BaseEntityProps } from '@domain/common/entities/base.entity';
import { PaymentMethod } from '../value-objects/payment-method.enum';
import { PaymentStatus } from '../value-objects/payment-status.enum';

export interface PaymentProps extends BaseEntityProps {
  id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paidAt?: Date;
  refundedAt?: Date;
  refundReason?: string;
  metadata?: Record<string, any>;
}

export interface CreatePaymentDTO {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  transactionId?: string;
  metadata?: Record<string, any>;
}

export class Payment extends BaseEntity<PaymentProps> {
  private constructor(props: PaymentProps) {
    super(props);
  }

  /**
   * Cria um novo payment
   */
  static create(props: CreatePaymentDTO): Payment {
    // Validações
    if (!props.invoiceId || props.invoiceId.trim().length === 0) {
      throw new Error('Invoice ID is required');
    }

    if (props.amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }

    const now = new Date();

    return new Payment({
      id: crypto.randomUUID(),
      invoiceId: props.invoiceId,
      amount: Math.round(props.amount * 100) / 100,
      method: props.method,
      status: PaymentStatus.PENDING,
      transactionId: props.transactionId?.trim(),
      paidAt: undefined,
      refundedAt: undefined,
      refundReason: undefined,
      metadata: props.metadata,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Cria um payment a partir de props existentes (para recuperação do banco)
   */
  static fromProps(props: PaymentProps): Payment {
    return new Payment(props);
  }

  /**
   * Retorna o ID da invoice
   */
  get invoiceId(): string {
    return this.props.invoiceId;
  }

  /**
   * Retorna o valor do pagamento
   */
  get amount(): number {
    return this.props.amount;
  }

  /**
   * Retorna o método de pagamento
   */
  get method(): PaymentMethod {
    return this.props.method;
  }

  /**
   * Retorna o status do pagamento
   */
  get status(): PaymentStatus {
    return this.props.status;
  }

  /**
   * Retorna o ID da transação
   */
  get transactionId(): string | undefined {
    return this.props.transactionId;
  }

  /**
   * Retorna a data de pagamento
   */
  get paidAt(): Date | undefined {
    return this.props.paidAt;
  }

  /**
   * Retorna a data de reembolso
   */
  get refundedAt(): Date | undefined {
    return this.props.refundedAt;
  }

  /**
   * Retorna o motivo do reembolso
   */
  get refundReason(): string | undefined {
    return this.props.refundReason;
  }

  /**
   * Retorna metadados do pagamento
   */
  get metadata(): Record<string, any> | undefined {
    return this.props.metadata;
  }

  /**
   * Atualiza o valor do pagamento
   */
  updateAmount(amount: number): void {
    if (amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }
    if (this.isApproved() || this.isRefunded()) {
      throw new Error('Cannot update amount of an approved or refunded payment');
    }
    this.props.amount = Math.round(amount * 100) / 100;
    this.touch();
  }

  /**
   * Atualiza o ID da transação
   */
  updateTransactionId(transactionId: string): void {
    this.props.transactionId = transactionId?.trim();
    this.touch();
  }

  /**
   * Aprova o pagamento
   */
  approve(): void {
    if (this.props.status === PaymentStatus.APPROVED) {
      throw new Error('Payment is already approved');
    }
    if (this.props.status === PaymentStatus.REJECTED) {
      throw new Error('Cannot approve a rejected payment');
    }
    this.props.status = PaymentStatus.APPROVED;
    this.props.paidAt = new Date();
    this.touch();
  }

  /**
   * Rejeita o pagamento
   */
  reject(reason?: string): void {
    if (this.props.status === PaymentStatus.APPROVED) {
      throw new Error('Cannot reject an approved payment');
    }
    this.props.status = PaymentStatus.REJECTED;
    this.touch();
  }

  /**
   * Estorna/reembolsa o pagamento
   */
  refund(reason: string): void {
    if (this.props.status !== PaymentStatus.APPROVED) {
      throw new Error('Can only refund an approved payment');
    }
    this.props.status = PaymentStatus.REFUNDED;
    this.props.refundedAt = new Date();
    this.props.refundReason = reason;
    this.touch();
  }

  /**
   * Marca como chargeback (contestação)
   */
  markAsChargeback(): void {
    if (this.props.status !== PaymentStatus.APPROVED) {
      throw new Error('Can only mark chargeback for approved payments');
    }
    this.props.status = PaymentStatus.CHARGEBACK;
    this.touch();
  }

  /**
   * Verifica se o pagamento está pendente
   */
  isPending(): boolean {
    return this.props.status === PaymentStatus.PENDING;
  }

  /**
   * Verifica se o pagamento está aprovado
   */
  isApproved(): boolean {
    return this.props.status === PaymentStatus.APPROVED;
  }

  /**
   * Verifica se o pagamento está rejeitado
   */
  isRejected(): boolean {
    return this.props.status === PaymentStatus.REJECTED;
  }

  /**
   * Verifica se o pagamento está estornado
   */
  isRefunded(): boolean {
    return this.props.status === PaymentStatus.REFUNDED;
  }

  /**
   * Verifica se o pagamento está em chargeback
   */
  isChargeback(): boolean {
    return this.props.status === PaymentStatus.CHARGEBACK;
  }

  /**
   * Formata o valor do pagamento como string
   */
  formatAmount(locale = 'pt-BR'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'BRL',
    }).format(this.props.amount);
  }

  /**
   * Converte payment para objeto simples
   */
  override toObject(): PaymentProps {
    return { ...this.props };
  }
}
