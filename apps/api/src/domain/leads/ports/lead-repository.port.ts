/**
 * Lead Repository Port
 * 
 * Interface que define as operações de repositório para Leads
 * Segue o padrão Repository da arquitetura hexagonal
 */

import { Lead } from '../entities/lead.entity';
import { LeadStatus } from '../value-objects/lead-status.enum';

export interface LeadFilters {
  status?: LeadStatus;
  assignedTo?: string;
  source?: string;
  offset?: number;
  limit?: number;
}

export interface LeadRepositoryPort {
  /**
   * Busca um lead pelo ID
   */
  findById(id: string): Promise<Lead | null>;

  /**
   * Busca um lead pelo email
   */
  findByEmail(email: string): Promise<Lead | null>;

  /**
   * Busca leads por status
   */
  findByStatus(status: LeadStatus): Promise<Lead[]>;

  /**
   * Busca leads por usuário responsável
   */
  findByAssignedTo(userId: string): Promise<Lead[]>;

  /**
   * Busca todos os leads com filtros opcionais
   */
  findAll(filters?: LeadFilters): Promise<Lead[]>;

  /**
   * Cria um novo lead
   */
  create(lead: Lead): Promise<void>;

  /**
   * Atualiza um lead existente
   */
  update(lead: Lead): Promise<void>;

  /**
   * Remove um lead (soft delete)
   */
  delete(id: string): Promise<void>;
}
