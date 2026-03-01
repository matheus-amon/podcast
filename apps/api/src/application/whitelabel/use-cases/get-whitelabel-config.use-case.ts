/**
 * Get Whitelabel Config Use Case
 *
 * Caso de uso para buscar a configuração de whitelabel atual
 */

import { WhitelabelConfig } from '@domain/whitelabel/entities/whitelabel-config.entity';
import { IWhitelabelRepository } from '@domain/whitelabel/ports/whitelabel.repository.port';

export interface GetWhitelabelConfigOutput {
  config: WhitelabelConfig;
  isNew: boolean; // Indica se foi criada uma nova configuração padrão
}

export class GetWhitelabelConfig {
  constructor(private readonly whitelabelRepository: IWhitelabelRepository) {}

  /**
   * Executa o caso de uso para buscar configuração de whitelabel
   * Se não existir configuração, cria uma nova com valores padrão
   */
  async execute(): Promise<GetWhitelabelConfigOutput> {
    // Tenta buscar configuração existente
    let config = await this.whitelabelRepository.find();

    if (!config) {
      // Cria configuração padrão se não existir
      config = WhitelabelConfig.create();
      await this.whitelabelRepository.save(config);

      return {
        config,
        isNew: true,
      };
    }

    return {
      config,
      isNew: false,
    };
  }
}
