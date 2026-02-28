/**
 * Delete Lead Use Case
 * 
 * Caso de uso para remoção de leads (soft delete)
 */

import type { LeadRepositoryPort } from '@domain/leads/ports/lead-repository.port';

export class DeleteLeadUseCase {
  constructor(private readonly leadRepository: LeadRepositoryPort) {}

  /**
   * Executa o caso de uso de deleção de lead
   */
  async execute(id: string): Promise<void> {
    // Buscar lead existente
    const existingLead = await this.leadRepository.findById(id);
    if (!existingLead) {
      throw new Error('Lead not found');
    }

    // Realizar soft delete
    await this.leadRepository.delete(id);
  }
}
