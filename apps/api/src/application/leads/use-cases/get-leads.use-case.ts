/**
 * Get Leads Use Case
 * 
 * Caso de uso para busca de leads com filtros e paginação
 */

import { Lead } from '@domain/leads/entities/lead.entity';
import type { LeadRepositoryPort, LeadFilters } from '@domain/leads/ports/lead-repository.port';

export interface GetLeadsResult {
  data: Lead[];
  total: number;
}

export class GetLeadsUseCase {
  constructor(private readonly leadRepository: LeadRepositoryPort) {}

  /**
   * Executa o caso de uso de busca de leads
   */
  async execute(filters?: LeadFilters): Promise<GetLeadsResult> {
    const data = await this.leadRepository.findAll(filters);
    
    return {
      data,
      total: data.length,
    };
  }

  /**
   * Busca um lead por ID
   */
  async getById(id: string): Promise<Lead> {
    const lead = await this.leadRepository.findById(id);
    if (!lead) {
      throw new Error('Lead not found');
    }
    return lead;
  }

  /**
   * Busca um lead por email
   */
  async getByEmail(email: string): Promise<Lead> {
    const lead = await this.leadRepository.findByEmail(email);
    if (!lead) {
      throw new Error('Lead not found');
    }
    return lead;
  }
}
