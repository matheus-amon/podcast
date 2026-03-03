/**
 * Invoice Entity
 *
 * Representa uma fatura/conta a receber no sistema de billing
 */

import { BaseEntity } from '@domain/common/entities/base.entity';
import type { BaseEntityProps } from '@domain/common/entities/base.entity';
import { BillingStatus } from '../value-objects/billing-status.enum';

export interface InvoiceProps extends BaseEntityProps {
  id: string;
  clientName: string;
  amount: number;
  dueDate: Date;
  status: BillingStatus;
  invoiceNumber?: string;
  subscriptionPlan?: string;
  description?: string;
  paidAt?: Date;
}

export interface CreateInvoiceDTO {
  clientName: string;
  amount: number;
  dueDate: Date;
  invoiceNumber?: string;
  subscriptionPlan?: string;
  description?: string;
}

export class Invoice extends BaseEntity<InvoiceProps> {
  private constructor(props: InvoiceProps) {
    super(props);
  }

  /**
   * Cria uma nova invoice
   */
  static create(props: CreateInvoiceDTO): Invoice {
    // Validações
    if (!props.clientName || props.clientName.trim().length === 0) {
      throw new Error('Client name is required');
    }

    if (props.amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }

    if (props.dueDate <= new Date()) {
      throw new Error('Due date must be in the future');
    }

    const now = new Date();

    return new Invoice({
      id: crypto.randomUUID(),
      clientName: props.clientName.trim(),
      amount: Math.round(props.amount * 100) / 100,
      dueDate: props.dueDate,
      status: BillingStatus.PENDING,
      invoiceNumber: props.invoiceNumber?.trim(),
      subscriptionPlan: props.subscriptionPlan?.trim(),
      description: props.description?.trim(),
      paidAt: undefined,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Cria uma invoice a partir de props existentes (para recuperação do banco)
   */
  static fromProps(props: InvoiceProps): Invoice {
    return new Invoice(props);
  }

  /**
   * Retorna o nome do cliente
   */
  get clientName(): string {
    return this.props.clientName;
  }

  /**
   * Retorna o valor da invoice
   */
  get amount(): number {
    return this.props.amount;
  }

  /**
   * Retorna a data de vencimento
   */
  get dueDate(): Date {
    return this.props.dueDate;
  }

  /**
   * Retorna o status da invoice
   */
  get status(): BillingStatus {
    return this.props.status;
  }

  /**
   * Retorna o número da invoice
   */
  get invoiceNumber(): string | undefined {
    return this.props.invoiceNumber;
  }

  /**
   * Retorna o plano de assinatura
   */
  get subscriptionPlan(): string | undefined {
    return this.props.subscriptionPlan;
  }

  /**
   * Retorna a descrição da invoice
   */
  get description(): string | undefined {
    return this.props.description;
  }

  /**
   * Retorna a data de pagamento
   */
  get paidAt(): Date | undefined {
    return this.props.paidAt;
  }

  /**
   * Atualiza o nome do cliente
   */
  updateClientName(clientName: string): void {
    if (!clientName || clientName.trim().length === 0) {
      throw new Error('Client name is required');
    }
    this.props.clientName = clientName.trim();
    this.touch();
  }

  /**
   * Atualiza o valor da invoice
   */
  updateAmount(amount: number): void {
    if (amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }
    if (this.isPaid()) {
      throw new Error('Cannot update amount of a paid invoice');
    }
    this.props.amount = Math.round(amount * 100) / 100;
    this.touch();
  }

  /**
   * Atualiza a data de vencimento
   */
  updateDueDate(dueDate: Date): void {
    if (this.isPaid()) {
      throw new Error('Cannot update due date of a paid invoice');
    }
    this.props.dueDate = dueDate;
    this.touch();
  }

  /**
   * Atualiza o número da invoice
   */
  updateInvoiceNumber(invoiceNumber: string): void {
    this.props.invoiceNumber = invoiceNumber?.trim();
    this.touch();
  }

  /**
   * Atualiza o plano de assinatura
   */
  updateSubscriptionPlan(subscriptionPlan: string): void {
    this.props.subscriptionPlan = subscriptionPlan?.trim();
    this.touch();
  }

  /**
   * Atualiza a descrição
   */
  updateDescription(description: string): void {
    this.props.description = description?.trim();
    this.touch();
  }

  /**
   * Marca a invoice como paga
   */
  markAsPaid(): void {
    if (this.props.status === BillingStatus.PAID) {
      throw new Error('Invoice is already paid');
    }
    if (this.props.status === BillingStatus.CANCELLED) {
      throw new Error('Cannot pay a cancelled invoice');
    }
    this.props.status = BillingStatus.PAID;
    this.props.paidAt = new Date();
    this.touch();
  }

  /**
   * Marca a invoice como vencida
   */
  markAsOverdue(): void {
    if (this.props.status === BillingStatus.PAID) {
      throw new Error('Cannot mark a paid invoice as overdue');
    }
    this.props.status = BillingStatus.OVERDUE;
    this.touch();
  }

  /**
   * Cancela a invoice
   */
  cancel(): void {
    if (this.props.status === BillingStatus.PAID) {
      throw new Error('Cannot cancel a paid invoice');
    }
    this.props.status = BillingStatus.CANCELLED;
    this.touch();
  }

  /**
   * Reativa uma invoice cancelada ou vencida
   */
  reactivate(): void {
    if (this.props.status === BillingStatus.PAID) {
      throw new Error('Cannot reactivate a paid invoice');
    }
    this.props.status = BillingStatus.PENDING;
    this.touch();
  }

  /**
   * Verifica se a invoice está paga
   */
  isPaid(): boolean {
    return this.props.status === BillingStatus.PAID;
  }

  /**
   * Verifica se a invoice está pendente
   */
  isPending(): boolean {
    return this.props.status === BillingStatus.PENDING;
  }

  /**
   * Verifica se a invoice está vencida
   */
  isOverdue(): boolean {
    return this.props.status === BillingStatus.OVERDUE;
  }

  /**
   * Verifica se a invoice está cancelada
   */
  isCancelled(): boolean {
    return this.props.status === BillingStatus.CANCELLED;
  }

  /**
   * Verifica se a invoice está vencida (comparando com data atual)
   */
  isPastDue(): boolean {
    return this.props.dueDate < new Date() && this.props.status !== BillingStatus.PAID;
  }

  /**
   * Formata o valor da invoice como string
   */
  formatAmount(locale = 'pt-BR'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'BRL',
    }).format(this.props.amount);
  }

  /**
   * Converte invoice para objeto simples
   */
  override toObject(): InvoiceProps {
    return { ...this.props };
  }
}
