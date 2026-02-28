/**
 * Lead Status Enum
 * 
 * Representa o status de um lead no funil de vendas
 * Nota: Deve match com o enum do schema do Drizzle (leadStatusEnum)
 */

export enum LeadStatus {
  PROSPECT = 'PROSPECT',
  CONTACTED = 'CONTACTED',
  CONFIRMED = 'CONFIRMED',
  RECORDED = 'RECORDED',
}
