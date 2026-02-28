/**
 * Create Lead Use Case
 *
 * Caso de uso para criação de novos leads
 * Orquestra a validação e persistência de um lead
 */

import { Lead, type CreateLeadProps } from '@domain/leads/entities/lead.entity';
import type { LeadRepositoryPort } from '@domain/leads/ports/lead-repository.port';

export class CreateLeadUseCase {
  constructor(private readonly leadRepository: LeadRepositoryPort) {}

  /**
   * Executa o caso de uso de criação de lead
   */
  async execute(props: CreateLeadProps): Promise<Lead> {
    // Verificar se email já existe
    const existingLead = await this.leadRepository.findByEmail(props.email);
    if (existingLead) {
      throw new Error('Lead with this email already exists');
    }

    // Criar novo lead
    const lead = Lead.create(props);

    // Persistir lead
    await this.leadRepository.create(lead);

    return lead;
  }
}
