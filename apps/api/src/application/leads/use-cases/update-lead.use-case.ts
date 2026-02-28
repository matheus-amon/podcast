/**
 * Update Lead Use Case
 * 
 * Caso de uso para atualização de leads existentes
 */

import { Lead, type LeadProps } from '@domain/leads/entities/lead.entity';
import type { LeadRepositoryPort } from '@domain/leads/ports/lead-repository.port';

export interface UpdateLeadProps extends Partial<Omit<LeadProps, 'id' | 'createdAt' | 'updatedAt'>> {
  id: string;
}

export class UpdateLeadUseCase {
  constructor(private readonly leadRepository: LeadRepositoryPort) {}

  /**
   * Executa o caso de uso de atualização de lead
   */
  async execute(props: UpdateLeadProps): Promise<Lead> {
    // Buscar lead existente
    const existingLead = await this.leadRepository.findById(props.id);
    if (!existingLead) {
      throw new Error('Lead not found');
    }

    // Atualizar campos permitidos
    if (props.name !== undefined) {
      existingLead.updateName(props.name);
    }

    if (props.email !== undefined) {
      // Verificar se novo email já existe em outro lead
      const emailExists = await this.leadRepository.findByEmail(props.email);
      if (emailExists && emailExists.id !== existingLead.id) {
        throw new Error('Another lead with this email already exists');
      }
      existingLead.updateEmail(props.email);
    }

    if (props.phone !== undefined) {
      existingLead.updatePhone(props.phone);
    }

    if (props.source !== undefined) {
      existingLead.updateSource(props.source);
    }

    if (props.assignedTo !== undefined) {
      existingLead.assignToUser(props.assignedTo);
    }

    // Persistir atualizações
    await this.leadRepository.update(existingLead);

    return existingLead;
  }
}
