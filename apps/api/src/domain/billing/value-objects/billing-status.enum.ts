/**
 * Billing Status Enum
 *
 * Define os status possíveis de uma invoice:
 * - PENDING: Invoice criada, aguardando pagamento
 * - PAID: Invoice paga
 * - OVERDUE: Invoice vencida sem pagamento
 * - CANCELLED: Invoice cancelada
 */

export enum BillingStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

/**
 * Verifica se um valor é um BillingStatus válido
 */
export function isValidBillingStatus(value: string): value is BillingStatus {
  return Object.values(BillingStatus).includes(value as BillingStatus);
}

/**
 * Verifica se uma invoice está paga
 */
export function isInvoicePaid(status: BillingStatus): boolean {
  return status === BillingStatus.PAID;
}

/**
 * Verifica se uma invoice está pendente
 */
export function isInvoicePending(status: BillingStatus): boolean {
  return status === BillingStatus.PENDING;
}

/**
 * Verifica se uma invoice está vencida
 */
export function isInvoiceOverdue(status: BillingStatus): boolean {
  return status === BillingStatus.OVERDUE;
}
