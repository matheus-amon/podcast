/**
 * Payment Status Enum
 *
 * Define os status possíveis de um pagamento
 */

export enum PaymentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REFUNDED = 'REFUNDED',
  CHARGEBACK = 'CHARGEBACK',
}

/**
 * Verifica se um valor é um PaymentStatus válido
 */
export function isValidPaymentStatus(value: string): value is PaymentStatus {
  return Object.values(PaymentStatus).includes(value as PaymentStatus);
}

/**
 * Verifica se um pagamento está aprovado
 */
export function isPaymentApproved(status: PaymentStatus): boolean {
  return status === PaymentStatus.APPROVED;
}

/**
 * Verifica se um pagamento está pendente
 */
export function isPaymentPending(status: PaymentStatus): boolean {
  return status === PaymentStatus.PENDING;
}
