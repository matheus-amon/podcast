/**
 * Postgres Lead Repository Adapter
 * 
 * Implementação do LeadRepositoryPort usando PostgreSQL + Drizzle ORM
 * Adaptado para o schema existente da tabela 'leads'
 */

import { Lead } from '@domain/leads/entities/lead.entity';
import { LeadStatus } from '@domain/leads/value-objects/lead-status.enum';
import type { LeadRepositoryPort, LeadFilters } from '@domain/leads/ports/lead-repository.port';
import { db } from '@db/index';
import { leads, leadStatusEnum } from '@db/schema';
import { eq, and, desc, type SQL, sql } from 'drizzle-orm';

export class PostgresLeadRepository implements LeadRepositoryPort {
  /**
   * Busca um lead pelo ID
   */
  async findById(id: string): Promise<Lead | null> {
    const result = await db.query.leads.findFirst({
      where: eq(leads.id, parseInt(id)),
    });

    if (!result) {
      return null;
    }

    return this.mapToLead(result);
  }

  /**
   * Busca um lead pelo email
   */
  async findByEmail(email: string): Promise<Lead | null> {
    const result = await db.query.leads.findFirst({
      where: eq(leads.email, email.toLowerCase()),
    });

    if (!result) {
      return null;
    }

    return this.mapToLead(result);
  }

  /**
   * Busca leads por status
   */
  async findByStatus(status: LeadStatus): Promise<Lead[]> {
    const results = await db.query.leads.findMany({
      where: eq(leads.status, status as any), // Cast necessário para match com enum do Drizzle
      orderBy: [desc(leads.createdAt)],
    });

    return results.map((r) => this.mapToLead(r));
  }

  /**
   * Busca leads por usuário responsável
   */
  async findByAssignedTo(userId: string): Promise<Lead[]> {
    const results = await db.query.leads.findMany({
      where: eq(leads.assignedTo, userId),
      orderBy: [desc(leads.createdAt)],
    }) as any[];

    return results.map((r) => this.mapToLead(r));
  }

  /**
   * Busca todos os leads com filtros opcionais
   */
  async findAll(filters?: LeadFilters): Promise<Lead[]> {
    const conditions: SQL[] = [];

    if (filters?.status) {
      conditions.push(eq(leads.status, filters.status as any));
    }

    if (filters?.assignedTo) {
      conditions.push(eq(leads.assignedTo, filters.assignedTo));
    }

    if (filters?.source) {
      conditions.push(eq(leads.source, filters.source));
    }

    // Filtrar apenas leads não deletados
    conditions.push(sql`${leads.deletedAt} IS NULL`);

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const offset = filters?.offset ?? 0;
    const limit = filters?.limit ?? 20;

    const results = await db.query.leads.findMany({
      where: whereClause,
      orderBy: [desc(leads.createdAt)],
      offset,
      limit,
    });

    return results.map((r: any) => this.mapToLead(r));
  }

  /**
   * Cria um novo lead
   */
  async create(lead: Lead): Promise<void> {
    const obj = lead.toObject();

    await db.insert(leads).values({
      name: obj.name,
      email: obj.email,
      phone: obj.phone || null,
      status: obj.status as any,
      source: obj.source,
      assignedTo: obj.assignedTo || null,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    });
  }

  /**
   * Atualiza um lead existente
   */
  async update(lead: Lead): Promise<void> {
    const obj = lead.toObject();

    await db
      .update(leads)
      .set({
        name: obj.name,
        email: obj.email,
        phone: obj.phone || null,
        status: obj.status as any,
        source: obj.source,
        assignedTo: obj.assignedTo || null,
        updatedAt: new Date(),
      })
      .where(eq(leads.id, parseInt(obj.id)));
  }

  /**
   * Remove um lead (soft delete)
   */
  async delete(id: string): Promise<void> {
    await db
      .update(leads)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(leads.id, parseInt(id)));
  }

  /**
   * Mapeia dados do banco para entity Lead
   */
  private mapToLead(data: any): Lead {
    return Lead.fromProps({
      id: data.id.toString(),
      name: data.name,
      email: data.email,
      phone: data.phone ?? '',
      status: data.status,
      source: data.source ?? 'unknown',
      assignedTo: data.assignedTo ?? '',
      createdAt: data.createdAt,
      updatedAt: data.updatedAt ?? data.createdAt,
      deletedAt: data.deletedAt ?? undefined,
    });
  }
}
