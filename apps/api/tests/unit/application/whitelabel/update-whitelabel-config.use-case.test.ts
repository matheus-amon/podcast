/**
 * UpdateWhitelabelConfig Use Case Tests
 *
 * Testes TDD para o caso de uso UpdateWhitelabelConfig
 */

import { describe, it, expect } from 'bun:test';
import { UpdateWhitelabelConfig } from '../../../../src/application/whitelabel/use-cases/update-whitelabel-config.use-case';
import { WhitelabelConfig } from '../../../../src/domain/whitelabel/entities/whitelabel-config.entity';
import type { IWhitelabelRepository } from '../../../../src/domain/whitelabel/ports/whitelabel.repository.port';

describe('UpdateWhitelabelConfig', () => {
  describe('execute', () => {
    it('should create new config when it does not exist', async () => {
      let savedConfig: WhitelabelConfig | undefined;

      const mockRepository: IWhitelabelRepository = {
        find: async () => null,
        findById: async () => null,
        save: async (config) => {
          savedConfig = config;
          return config;
        },
        update: async () => {
          throw new Error('Should not call update when creating new config');
        },
        upsert: async () => {
          throw new Error('Should not call upsert in this use case');
        },
      };

      const useCase = new UpdateWhitelabelConfig(mockRepository);
      const result = await useCase.execute({
        primaryColor: '#FF5733',
        secondaryColor: '#33FF57',
        companyName: 'My Company',
      });

      expect(result.config).toBeDefined();
      expect(result.created).toBe(true);
      expect(savedConfig).toBeDefined();
    });

    it('should update existing config when it exists', async () => {
      const existingConfig = WhitelabelConfig.create();
      let updatedConfig: WhitelabelConfig | undefined;

      const mockRepository: IWhitelabelRepository = {
        find: async () => existingConfig,
        findById: async () => null,
        save: async () => {
          throw new Error('Should not call save when config exists');
        },
        update: async (config) => {
          updatedConfig = config;
          return config;
        },
        upsert: async () => {
          throw new Error('Should not call upsert in this use case');
        },
      };

      const useCase = new UpdateWhitelabelConfig(mockRepository);
      const result = await useCase.execute({
        primaryColor: '#FF5733',
        companyName: 'My Company',
      });

      expect(result.config).toBeDefined();
      expect(result.created).toBe(false);
      expect(updatedConfig).toBeDefined();
    });

    it('should update only provided fields when updating existing config', async () => {
      const existingConfig = WhitelabelConfig.create();
      const originalSecondaryColor = existingConfig.secondaryColor;
      const originalCompanyName = existingConfig.companyName;

      const mockRepository: IWhitelabelRepository = {
        find: async () => existingConfig,
        findById: async () => null,
        save: async () => existingConfig,
        update: async (config) => config,
        upsert: async () => existingConfig,
      };

      const useCase = new UpdateWhitelabelConfig(mockRepository);
      await useCase.execute({
        primaryColor: '#FF5733',
      });

      expect(existingConfig.primaryColor).toBe('#FF5733');
      expect(existingConfig.secondaryColor).toBe(originalSecondaryColor);
      expect(existingConfig.companyName).toBe(originalCompanyName);
    });

    it('should preserve null values when updating', async () => {
      const existingConfig = WhitelabelConfig.create({
        logoUrl: 'https://example.com/logo.png',
      });

      const mockRepository: IWhitelabelRepository = {
        find: async () => existingConfig,
        findById: async () => null,
        save: async () => existingConfig,
        update: async (config) => config,
        upsert: async () => existingConfig,
      };

      const useCase = new UpdateWhitelabelConfig(mockRepository);
      await useCase.execute({
        logoUrl: null,
      });

      expect(existingConfig.logoUrl).toBeNull();
    });

    it('should trim whitespace from string values', async () => {
      const existingConfig = WhitelabelConfig.create();

      const mockRepository: IWhitelabelRepository = {
        find: async () => existingConfig,
        findById: async () => null,
        save: async () => existingConfig,
        update: async (config) => config,
        upsert: async () => existingConfig,
      };

      const useCase = new UpdateWhitelabelConfig(mockRepository);
      await useCase.execute({
        primaryColor: '  #FF5733  ',
        companyName: '  My Company  ',
        subdomain: '  mycompany  ',
      });

      expect(existingConfig.primaryColor).toBe('#FF5733');
      expect(existingConfig.companyName).toBe('My Company');
      expect(existingConfig.subdomain).toBe('mycompany');
    });

    it('should return created=false when updating existing config', async () => {
      const existingConfig = WhitelabelConfig.create();

      const mockRepository: IWhitelabelRepository = {
        find: async () => existingConfig,
        findById: async () => null,
        save: async () => existingConfig,
        update: async (config) => config,
        upsert: async () => existingConfig,
      };

      const useCase = new UpdateWhitelabelConfig(mockRepository);
      const result = await useCase.execute({
        primaryColor: '#FF5733',
      });

      expect(result.created).toBe(false);
    });

    it('should return created=true when creating new config', async () => {
      const mockRepository: IWhitelabelRepository = {
        find: async () => null,
        findById: async () => null,
        save: async (config) => config,
        update: async () => {
          throw new Error('Should not call update when creating new config');
        },
        upsert: async () => {
          throw new Error('Should not call upsert in this use case');
        },
      };

      const useCase = new UpdateWhitelabelConfig(mockRepository);
      const result = await useCase.execute({
        primaryColor: '#FF5733',
      });

      expect(result.created).toBe(true);
    });
  });
});
