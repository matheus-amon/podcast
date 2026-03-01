/**
 * Whitelabel Repository Port
 *
 * Interface que define o contrato para repositórios de WhitelabelConfig
 */

import { WhitelabelConfig, CreateWhitelabelConfigProps } from '../entities/whitelabel-config.entity';

export interface IWhitelabelRepository {
  /**
   * Busca a configuração de whitelabel
   * Retorna null se não existir
   */
  find(): Promise<WhitelabelConfig | null>;

  /**
   * Busca a configuração por ID
   */
  findById(id: string): Promise<WhitelabelConfig | null>;

  /**
   * Salva uma nova configuração
   */
  save(config: WhitelabelConfig): Promise<WhitelabelConfig>;

  /**
   * Atualiza uma configuração existente
   */
  update(config: WhitelabelConfig): Promise<WhitelabelConfig>;

  /**
   * Cria ou atualiza a configuração (upsert)
   * Garante que sempre haverá apenas uma configuração ativa
   */
  upsert(config: WhitelabelConfig): Promise<WhitelabelConfig>;
}
