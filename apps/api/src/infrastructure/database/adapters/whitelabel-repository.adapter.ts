/**
 * Postgres Whitelabel Repository Adapter
 *
 * Implementação do IWhitelabelRepository usando PostgreSQL + Drizzle ORM
 * Adaptado para o schema existente da tabela 'whitelabel_config'
 */

import { WhitelabelConfig } from '@domain/whitelabel/entities/whitelabel-config.entity';
import { IWhitelabelRepository } from '@domain/whitelabel/ports/whitelabel.repository.port';
import { db } from '@db/index';
import { whitelabelConfig } from '@db/schema';
import { eq } from 'drizzle-orm';

/**
 * Tipo para os dados brutos do banco de dados
 */
type WhitelabelConfigDB = typeof whitelabelConfig.$inferSelect;

export class PostgresWhitelabelRepository implements IWhitelabelRepository {
  /**
   * Busca a configuração de whitelabel (primeiro registro)
   */
  async find(): Promise<WhitelabelConfig | null> {
    const result = await db.query.whitelabelConfig?.findFirst();

    if (!result) {
      return null;
    }

    return this.mapToEntity(result);
  }

  /**
   * Busca a configuração por ID
   */
  async findById(id: string): Promise<WhitelabelConfig | null> {
    const result = await db.query.whitelabelConfig?.findFirst({
      where: eq(whitelabelConfig.id, parseInt(id)),
    });

    if (!result) {
      return null;
    }

    return this.mapToEntity(result);
  }

  /**
   * Salva uma nova configuração
   */
  async save(config: WhitelabelConfig): Promise<WhitelabelConfig> {
    const props = config.toObject();
    const insertData = {
      logoUrl: props.logoUrl,
      primaryColor: props.primaryColor,
      secondaryColor: props.secondaryColor,
      companyName: props.companyName,
      subdomain: props.subdomain,
    };

    const result = await db
      .insert(whitelabelConfig)
      .values(insertData)
      .returning()
      .then((rows) => rows[0]);

    if (!result) {
      throw new Error('Failed to save whitelabel config');
    }

    return this.mapToEntity(result);
  }

  /**
   * Atualiza uma configuração existente
   */
  async update(config: WhitelabelConfig): Promise<WhitelabelConfig> {
    const props = config.toObject();
    const updateData = {
      logoUrl: props.logoUrl,
      primaryColor: props.primaryColor,
      secondaryColor: props.secondaryColor,
      companyName: props.companyName,
      subdomain: props.subdomain,
      updatedAt: new Date(),
    };

    const result = await db
      .update(whitelabelConfig)
      .set(updateData)
      .where(eq(whitelabelConfig.id, parseInt(config.id)))
      .returning()
      .then((rows) => rows[0]);

    if (!result) {
      throw new Error('Failed to update whitelabel config');
    }

    return this.mapToEntity(result);
  }

  /**
   * Cria ou atualiza a configuração (upsert)
   * Garante que sempre haverá apenas uma configuração ativa
   */
  async upsert(config: WhitelabelConfig): Promise<WhitelabelConfig> {
    const existing = await this.find();

    if (existing) {
      // Atualiza existente
      const props = config.toObject();
      const updateData = {
        logoUrl: props.logoUrl,
        primaryColor: props.primaryColor,
        secondaryColor: props.secondaryColor,
        companyName: props.companyName,
        subdomain: props.subdomain,
        updatedAt: new Date(),
      };

      const result = await db
        .update(whitelabelConfig)
        .set(updateData)
        .where(eq(whitelabelConfig.id, parseInt(existing.id)))
        .returning()
        .then((rows) => rows[0]);

      if (!result) {
        throw new Error('Failed to upsert whitelabel config');
      }

      return this.mapToEntity(result);
    }

    // Cria nova
    return this.save(config);
  }

  /**
   * Mapeia dados do banco para a entidade de domínio
   */
  private mapToEntity(dbData: WhitelabelConfigDB): WhitelabelConfig {
    return WhitelabelConfig.fromProps({
      id: dbData.id.toString(),
      logoUrl: dbData.logoUrl,
      primaryColor: dbData.primaryColor ?? '#3B82F6',
      secondaryColor: dbData.secondaryColor ?? '#1E40AF',
      companyName: dbData.companyName ?? 'Podcast SaaS',
      subdomain: dbData.subdomain,
      createdAt: dbData.createdAt ?? new Date(),
      updatedAt: dbData.updatedAt ?? new Date(),
    });
  }
}
