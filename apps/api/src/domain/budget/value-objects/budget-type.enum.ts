/**
 * Budget Type Enum
 *
 * Define os tipos de orçamento: INCOME (receita) ou EXPENSE (despesa)
 */

export enum BudgetType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

/**
 * Verifica se um valor é um BudgetType válido
 */
export function isValidBudgetType(value: string): value is BudgetType {
  return Object.values(BudgetType).includes(value as BudgetType);
}
