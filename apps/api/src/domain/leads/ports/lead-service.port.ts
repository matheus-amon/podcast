/**
 * Lead Service Port
 * 
 * Interface que define as operações de serviço para Leads
 * Contém regras de negócio que orquestram múltiplas operações
 */

import { LeadStatus } from '../value-objects/lead-status.enum';

export interface QualificationCriteria {
  budget?: number;
  timeline?: string;
  decisionMaker?: boolean;
  need?: string;
}

export interface LeadServicePort {
  /**
   * Atribui um lead a um usuário
   */
  assignToUser(leadId: string, userId: string): Promise<void>;

  /**
   * Altera o status de um lead
   */
  changeStatus(leadId: string, status: LeadStatus): Promise<void>;

  /**
   * Qualifica um lead com base em critérios
   */
  qualifyLead(leadId: string, criteria: QualificationCriteria): Promise<void>;

  /**
   * Contata um lead (muda status para CONTACTED)
   */
  contactLead(leadId: string): Promise<void>;

  /**
   * Confirma um lead (muda status para CONFIRMED)
   */
  confirmLead(leadId: string): Promise<void>;

  /**
   * Registra/Converte um lead (muda status para RECORDED)
   */
  recordLead(leadId: string): Promise<void>;
}
