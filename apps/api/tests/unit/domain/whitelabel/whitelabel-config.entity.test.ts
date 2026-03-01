/**
 * WhitelabelConfig Entity Tests
 *
 * Testes TDD para a entity WhitelabelConfig
 */

import { describe, it, expect } from 'bun:test';
import { WhitelabelConfig } from '../../../../src/domain/whitelabel/entities/whitelabel-config.entity';

describe('WhitelabelConfig', () => {
  describe('create', () => {
    it('should create whitelabel config with default values when no props provided', () => {
      const config = WhitelabelConfig.create();

      expect(config).toBeDefined();
      expect(config.logoUrl).toBeNull();
      expect(config.primaryColor).toBe('#3B82F6');
      expect(config.secondaryColor).toBe('#1E40AF');
      expect(config.companyName).toBe('Podcast SaaS');
      expect(config.subdomain).toBeNull();
    });

    it('should create whitelabel config with custom values when props provided', () => {
      const config = WhitelabelConfig.create({
        logoUrl: 'https://example.com/logo.png',
        primaryColor: '#FF5733',
        secondaryColor: '#33FF57',
        companyName: 'My Company',
        subdomain: 'mycompany',
      });

      expect(config).toBeDefined();
      expect(config.logoUrl).toBe('https://example.com/logo.png');
      expect(config.primaryColor).toBe('#FF5733');
      expect(config.secondaryColor).toBe('#33FF57');
      expect(config.companyName).toBe('My Company');
      expect(config.subdomain).toBe('mycompany');
    });

    it('should trim whitespace from string values', () => {
      const config = WhitelabelConfig.create({
        primaryColor: '  #FF5733  ',
        secondaryColor: '  #33FF57  ',
        companyName: '  My Company  ',
        subdomain: '  mycompany  ',
      });

      expect(config.primaryColor).toBe('#FF5733');
      expect(config.secondaryColor).toBe('#33FF57');
      expect(config.companyName).toBe('My Company');
      expect(config.subdomain).toBe('mycompany');
    });

    it('should generate unique id for each config', () => {
      const config1 = WhitelabelConfig.create();
      const config2 = WhitelabelConfig.create();

      expect(config1.id).not.toBe(config2.id);
    });

    it('should set createdAt and updatedAt timestamps', () => {
      const beforeCreate = new Date();
      const config = WhitelabelConfig.create();
      const afterCreate = new Date();

      expect(config.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(config.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
      expect(config.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(config.updatedAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });

    it('should accept null logoUrl', () => {
      const config = WhitelabelConfig.create({
        logoUrl: null,
      });

      expect(config.logoUrl).toBeNull();
    });

    it('should accept null subdomain', () => {
      const config = WhitelabelConfig.create({
        subdomain: null,
      });

      expect(config.subdomain).toBeNull();
    });
  });

  describe('fromProps', () => {
    it('should create config from existing props', () => {
      const now = new Date();
      const props = {
        id: 'test-id',
        logoUrl: 'https://example.com/logo.png',
        primaryColor: '#FF5733',
        secondaryColor: '#33FF57',
        companyName: 'My Company',
        subdomain: 'mycompany',
        createdAt: now,
        updatedAt: now,
      };

      const config = WhitelabelConfig.fromProps(props);

      expect(config.id).toBe('test-id');
      expect(config.logoUrl).toBe('https://example.com/logo.png');
      expect(config.primaryColor).toBe('#FF5733');
      expect(config.secondaryColor).toBe('#33FF57');
      expect(config.companyName).toBe('My Company');
      expect(config.subdomain).toBe('mycompany');
      expect(config.createdAt).toBe(now);
      expect(config.updatedAt).toBe(now);
    });
  });

  describe('updateLogoUrl', () => {
    it('should update logoUrl', () => {
      const config = WhitelabelConfig.create();

      config.updateLogoUrl('https://example.com/new-logo.png');

      expect(config.logoUrl).toBe('https://example.com/new-logo.png');
    });

    it('should update updatedAt timestamp', () => {
      const config = WhitelabelConfig.create();
      const beforeUpdate = config.updatedAt.getTime();

      // Aguardar 1ms para garantir diferença
      const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      return wait(1).then(() => {
        config.updateLogoUrl('https://example.com/new-logo.png');
        expect(config.updatedAt.getTime()).toBeGreaterThan(beforeUpdate);
      });
    });

    it('should set logoUrl to null', () => {
      const config = WhitelabelConfig.create({
        logoUrl: 'https://example.com/logo.png',
      });

      config.updateLogoUrl(null);

      expect(config.logoUrl).toBeNull();
    });
  });

  describe('updatePrimaryColor', () => {
    it('should update primaryColor', () => {
      const config = WhitelabelConfig.create();

      config.updatePrimaryColor('#FF5733');

      expect(config.primaryColor).toBe('#FF5733');
    });

    it('should trim whitespace from primaryColor', () => {
      const config = WhitelabelConfig.create();

      config.updatePrimaryColor('  #FF5733  ');

      expect(config.primaryColor).toBe('#FF5733');
    });

    it('should update updatedAt timestamp', () => {
      const config = WhitelabelConfig.create();
      const beforeUpdate = config.updatedAt.getTime();

      const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      return wait(1).then(() => {
        config.updatePrimaryColor('#FF5733');
        expect(config.updatedAt.getTime()).toBeGreaterThan(beforeUpdate);
      });
    });
  });

  describe('updateSecondaryColor', () => {
    it('should update secondaryColor', () => {
      const config = WhitelabelConfig.create();

      config.updateSecondaryColor('#33FF57');

      expect(config.secondaryColor).toBe('#33FF57');
    });

    it('should trim whitespace from secondaryColor', () => {
      const config = WhitelabelConfig.create();

      config.updateSecondaryColor('  #33FF57  ');

      expect(config.secondaryColor).toBe('#33FF57');
    });
  });

  describe('updateCompanyName', () => {
    it('should update companyName', () => {
      const config = WhitelabelConfig.create();

      config.updateCompanyName('New Company Name');

      expect(config.companyName).toBe('New Company Name');
    });

    it('should trim whitespace from companyName', () => {
      const config = WhitelabelConfig.create();

      config.updateCompanyName('  New Company Name  ');

      expect(config.companyName).toBe('New Company Name');
    });
  });

  describe('updateSubdomain', () => {
    it('should update subdomain', () => {
      const config = WhitelabelConfig.create();

      config.updateSubdomain('newsubdomain');

      expect(config.subdomain).toBe('newsubdomain');
    });

    it('should trim whitespace from subdomain', () => {
      const config = WhitelabelConfig.create();

      config.updateSubdomain('  newsubdomain  ');

      expect(config.subdomain).toBe('newsubdomain');
    });

    it('should set subdomain to null', () => {
      const config = WhitelabelConfig.create({
        subdomain: 'mycompany',
      });

      config.updateSubdomain(null);

      expect(config.subdomain).toBeNull();
    });
  });

  describe('updateAll', () => {
    it('should update all fields at once', () => {
      const config = WhitelabelConfig.create();

      config.updateAll({
        logoUrl: 'https://example.com/logo.png',
        primaryColor: '#FF5733',
        secondaryColor: '#33FF57',
        companyName: 'My Company',
        subdomain: 'mycompany',
      });

      expect(config.logoUrl).toBe('https://example.com/logo.png');
      expect(config.primaryColor).toBe('#FF5733');
      expect(config.secondaryColor).toBe('#33FF57');
      expect(config.companyName).toBe('My Company');
      expect(config.subdomain).toBe('mycompany');
    });

    it('should update only provided fields', () => {
      const config = WhitelabelConfig.create();
      const originalSecondaryColor = config.secondaryColor;
      const originalCompanyName = config.companyName;

      config.updateAll({
        primaryColor: '#FF5733',
        subdomain: 'mycompany',
      });

      expect(config.primaryColor).toBe('#FF5733');
      expect(config.subdomain).toBe('mycompany');
      expect(config.secondaryColor).toBe(originalSecondaryColor);
      expect(config.companyName).toBe(originalCompanyName);
    });

    it('should use default values when undefined is provided', () => {
      const config = WhitelabelConfig.create();

      config.updateAll({
        primaryColor: undefined,
      });

      expect(config.primaryColor).toBe('#3B82F6');
    });

    it('should update updatedAt timestamp', () => {
      const config = WhitelabelConfig.create();
      const beforeUpdate = config.updatedAt.getTime();

      const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      return wait(1).then(() => {
        config.updateAll({
          primaryColor: '#FF5733',
        });
        expect(config.updatedAt.getTime()).toBeGreaterThan(beforeUpdate);
      });
    });
  });

  describe('isDefault', () => {
    it('should return true when config has default values', () => {
      const config = WhitelabelConfig.create();

      expect(config.isDefault()).toBe(true);
    });

    it('should return false when logoUrl is set', () => {
      const config = WhitelabelConfig.create({
        logoUrl: 'https://example.com/logo.png',
      });

      expect(config.isDefault()).toBe(false);
    });

    it('should return false when primaryColor is different from default', () => {
      const config = WhitelabelConfig.create({
        primaryColor: '#FF5733',
      });

      expect(config.isDefault()).toBe(false);
    });

    it('should return false when secondaryColor is different from default', () => {
      const config = WhitelabelConfig.create({
        secondaryColor: '#33FF57',
      });

      expect(config.isDefault()).toBe(false);
    });

    it('should return false when companyName is different from default', () => {
      const config = WhitelabelConfig.create({
        companyName: 'My Company',
      });

      expect(config.isDefault()).toBe(false);
    });

    it('should return false when subdomain is set', () => {
      const config = WhitelabelConfig.create({
        subdomain: 'mycompany',
      });

      expect(config.isDefault()).toBe(false);
    });
  });

  describe('toObject', () => {
    it('should return a copy of props', () => {
      const config = WhitelabelConfig.create({
        logoUrl: 'https://example.com/logo.png',
        primaryColor: '#FF5733',
        secondaryColor: '#33FF57',
        companyName: 'My Company',
        subdomain: 'mycompany',
      });

      const obj = config.toObject();

      expect(obj).toBeDefined();
      expect(obj.id).toBe(config.id);
      expect(obj.logoUrl).toBe(config.logoUrl);
      expect(obj.primaryColor).toBe(config.primaryColor);
      expect(obj.secondaryColor).toBe(config.secondaryColor);
      expect(obj.companyName).toBe(config.companyName);
      expect(obj.subdomain).toBe(config.subdomain);
      expect(obj).not.toBe(config);
    });
  });
});
