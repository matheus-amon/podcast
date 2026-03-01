/**
 * Update Whitelabel Config Use Case
 *
 * Caso de uso para atualizar a configuração de whitelabel
 */

import { WhitelabelConfig, type CreateWhitelabelConfigProps } from '@domain/whitelabel/entities/whitelabel-config.entity';
import { IWhitelabelRepository } from '@domain/whitelabel/ports/whitelabel.repository.port';

export interface UpdateWhitelabelConfigInput extends CreateWhitelabelConfigProps {}

export interface UpdateWhitelabelConfigOutput {
  config: WhitelabelConfig;
  created: boolean; // Indica se foi criada uma nova configuração
}

export class UpdateWhitelabelConfig {
  constructor(private readonly whitelabelRepository: IWhitelabelRepository) {}

  /**
   * Executa o caso de uso para atualizar configuração de whitelabel
   * Se não existir configuração, cria uma nova
   */
  async execute(input: UpdateWhitelabelConfigInput): Promise<UpdateWhitelabelConfigOutput> {
    // Tenta buscar configuração existente
    let config = await this.whitelabelRepository.find();

    if (!config) {
      // Cria nova configuração com os valores fornecidos
      config = WhitelabelConfig.create(input);
      await this.whitelabelRepository.save(config);

      return {
        config,
        created: true,
      };
    }

    // Atualiza configuração existente
    config.updateAll(input);
    await this.whitelabelRepository.update(config);

    return {
      config,
      created: false,
    };
  }
}
