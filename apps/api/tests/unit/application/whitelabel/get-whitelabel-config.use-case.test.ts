/**
 * GetWhitelabelConfig Use Case Tests
 *
 * Testes TDD para o caso de uso GetWhitelabelConfig
 */

import { describe, it, expect } from 'bun:test';
import { GetWhitelabelConfig } from '../../../../src/application/whitelabel/use-cases/get-whitelabel-config.use-case';
import { WhitelabelConfig } from '../../../../src/domain/whitelabel/entities/whitelabel-config.entity';
import type { IWhitelabelRepository } from '../../../../src/domain/whitelabel/ports/whitelabel.repository.port';

describe('GetWhitelabelConfig', () => {
  describe('execute', () => {
    it('should return existing config when it exists', async () => {
      const existingConfig = WhitelabelConfig.create({
        logoUrl: 'https://example.com/logo.png',
        primaryColor: '#FF5733',
        secondaryColor: '#33FF57',
        companyName: 'My Company',
        subdomain: 'mycompany',
      });

      // Mock que retorna config existente
      const mockRepository: IWhitelabelRepository = {
        find: async () => existingConfig,
        findById: async () => null,
        save: async () => {
          throw new Error('Should not call save when config exists');
        },
        update: async () => {
          throw new Error('Should not call update in this use case');
        },
        upsert: async () => {
          throw new Error('Should not call upsert in this use case');
        },
      };

      const useCase = new GetWhitelabelConfig(mockRepository);
      const result = await useCase.execute();

      expect(result.config).toBeDefined();
      expect(result.config.id).toBe(existingConfig.id);
      expect(result.isNew).toBe(false);
    });

    it('should create and return default config when it does not exist', async () => {
      let savedConfig: WhitelabelConfig | undefined;

      // Mock que retorna null e salva nova config
      const mockRepository: IWhitelabelRepository = {
        find: async () => null,
        findById: async () => null,
        save: async (config) => {
          savedConfig = config;
          return config;
        },
        update: async () => {
          throw new Error('Should not call update in this use case');
        },
        upsert: async () => {
          throw new Error('Should not call upsert in this use case');
        },
      };

      const useCase = new GetWhitelabelConfig(mockRepository);
      const result = await useCase.execute();

      expect(result.config).toBeDefined();
      expect(result.isNew).toBe(true);
      expect(savedConfig).toBeDefined();
    });

    it('should return config with default values when creating new config', async () => {
      // Mock que retorna null e salva nova config
      const mockRepository: IWhitelabelRepository = {
        find: async () => null,
        findById: async () => null,
        save: async (config) => config,
        update: async () => {
          throw new Error('Should not call update in this use case');
        },
        upsert: async () => {
          throw new Error('Should not call upsert in this use case');
        },
      };

      const useCase = new GetWhitelabelConfig(mockRepository);
      const result = await useCase.execute();

      expect(result.config.logoUrl).toBeNull();
      expect(result.config.primaryColor).toBe('#3B82F6');
      expect(result.config.secondaryColor).toBe('#1E40AF');
      expect(result.config.companyName).toBe('Podcast SaaS');
      expect(result.config.subdomain).toBeNull();
    });
  });
});
