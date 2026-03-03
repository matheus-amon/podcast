/**
 * Budget Status Enum
 *
 * Define os status possíveis de um orçamento:
 * - PLANNED: Orçamento planejado, ainda não aprovado
 * - APPROVED: Orçamento aprovado, aguardando pagamento
 * - PENDING: Orçamento pendente de revisão
 * - PAID: Orçamento pago/recebido
 */

export enum BudgetStatus {
  PLANNED = 'PLANNED',
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
  PAID = 'PAID',
}

/**
 * Verifica se um valor é um BudgetStatus válido
 */
export function isValidBudgetStatus(value: string): value is BudgetStatus {
  return Object.values(BudgetStatus).includes(value as BudgetStatus);
}

/**
 * Retorna se um budget está fechado (pago)
 */
export function isBudgetClosed(status: BudgetStatus): boolean {
  return status === BudgetStatus.PAID;
}

/**
 * Retorna se um budget está pendente de aprovação
 */
export function isBudgetPending(status: BudgetStatus): boolean {
  return status === BudgetStatus.PENDING || status === BudgetStatus.PLANNED;
}
